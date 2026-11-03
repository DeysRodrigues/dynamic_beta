import { localStorageAdapter, setStorageAdapter } from "@/persistence/adapter";
import { bumpEpoch, isDefaultValue, rehydrateKeyQuietly } from "@/persistence/hydration";
import { PERSISTED, PERSISTED_ENTRIES } from "@/persistence/registry";
import { browserStorage } from "@/persistence/storage";
import { ApiError, createApi, discoverServer, normalizeServerUrl, type Account } from "./api";
import { SyncEngine } from "./engine";
import { useSession } from "./session";
import { useSync } from "./status";
import { createSyncAdapter } from "./syncAdapter";

let engine: SyncEngine | undefined;

const syncKeys = PERSISTED_ENTRIES.map(({ key, version, label }) => ({ key, version, label }));

/** The signed-in session's client, always using the current token. */
function sessionApi(serverUrl: string) {
  return createApi({
    baseUrl: serverUrl,
    getToken: () => useSession.getState().token,
    onUnauthorized: () => disconnect("expired"),
  });
}

/** Starts syncing for the account in the session: plugs in the synced adapter and runs the first round. */
async function startEngine(serverUrl: string, user: Account) {
  engine?.stop();
  const api = sessionApi(serverUrl);

  engine = new SyncEngine({
    api,
    storage: browserStorage,
    bookkeeping: browserStorage,
    keys: syncKeys,
    identity: `${serverUrl}|${user.id}`,
    isDefault: isDefaultValue,
    applyRemote: async (key) => {
      await rehydrateKeyQuietly(key);
      // Widgets keep what they read when they opened, so they have to start over from the new content.
      if (key === PERSISTED.boxContent.key) bumpEpoch();
    },
    onUnauthorized: () => disconnect("expired"),
  });

  // The synced adapter serves the same local copy the stores already read, so they stay valid.
  setStorageAdapter(createSyncAdapter(browserStorage, engine), { keepReads: true });
  await engine.start();
}

/** Why the last sign-out happened, so the screen can explain it. */
export const lastDisconnect = { reason: null as null | "expired" | "user" | "deleted" };

/**
 * Signs in (or creates the account) on a server and starts syncing. Throws an `ApiError` when it
 * cannot; the caller turns that into a message with `describeError`.
 */
export async function connect(options: { serverUrl: string; mode: "login" | "register"; email: string; password: string }) {
  const typed = normalizeServerUrl(options.serverUrl);
  if (!typed) throw new ApiError("network");

  // The address may be the app's (http://localhost:8080) while the API is under /api.
  const { baseUrl: serverUrl } = await discoverServer(typed);
  const api = createApi({ baseUrl: serverUrl });
  const { token, user } = options.mode === "register" ? await api.register(options.email, options.password) : await api.login(options.email, options.password);

  useSession.getState().setSession(serverUrl, token, user);
  lastDisconnect.reason = null;
  useSync.setState({ problem: null });
  await startEngine(serverUrl, user);
}

/** Boot: picks the session back up after a reload. */
export function resumeSession() {
  const { serverUrl, token, user } = useSession.getState();
  if (!serverUrl || !token || !user) return;
  // Not awaited: the app is already usable from the local copy while the first round runs.
  void startEngine(serverUrl, user);
}

/** Back to using only this browser. The data stays where it is. */
export function disconnect(reason: "expired" | "user" | "deleted" = "user") {
  engine?.forget();
  engine = undefined;
  useSession.getState().clearSession();
  setStorageAdapter(localStorageAdapter, { keepReads: true });
  const problem = reason === "expired" ? "session_expired" : reason === "deleted" ? "data_deleted" : null;
  useSync.setState({ status: "local", conflicts: [], documents: [], pending: 0, problem, lastSyncAt: null });
  lastDisconnect.reason = reason;
}

export const syncNow = () => engine?.syncNow() ?? Promise.resolve();
export const resolveConflict = (key: string, choice: "server" | "local") => engine?.resolve(key, choice) ?? Promise.resolve();
export const resolveAllConflicts = (choice: "server" | "local") => engine?.resolveAll(choice) ?? Promise.resolve();

/** Deletes this account's copy on the server, then returns to local-only. The browser keeps its data. */
export async function deleteServerData() {
  const { serverUrl } = useSession.getState();
  if (!serverUrl) return;
  await sessionApi(serverUrl).deleteAll();
  disconnect("deleted");
}
