import type { KeyValueStorage } from "@/persistence/storage";
import { ApiError, type ServerDocument, type SyncApi } from "./api";
import { fingerprint, sameData, tryParse } from "./json";
import { useSync, type Conflict, type SyncedDocument, type SyncStatus } from "./status";

export interface SyncKey {
  key: string;
  /** The shape of this key's data in this version of the app. */
  version: number;
  label: string;
}

export interface EngineDeps {
  api: SyncApi;
  /** Where the saved values live (the browser's `localStorage`). */
  storage: KeyValueStorage;
  /** Where the engine remembers, between visits, what it has already synced. */
  bookkeeping: KeyValueStorage;
  keys: readonly SyncKey[];
  /** Who and where: a different account or server starts the bookkeeping over. */
  identity: string;
  /**
   * Whether a value is just what the app starts with (nothing the person made). A key like that is
   * treated as empty when this device meets the server, so a fresh browser does not raise a
   * conflict over data that is only defaults.
   */
  isDefault?: (key: string, value: unknown) => boolean;
  /** A newer copy of `key` was written locally: make the app read it. */
  applyRemote: (key: string) => Promise<void> | void;
  onUnauthorized?: () => void;
  /** Wait this long after the last change before sending it. */
  debounceMs?: number;
  /** Look for news from the server this often. */
  pollMs?: number;
  /** Try again this long after a failed attempt. */
  retryMs?: number;
}

const LEDGER_KEY = "dynabox-sync-ledger";

interface Ledger {
  identity: string;
  /** The revision of each key that this device last saw on the server. */
  revisions: Record<string, number>;
  /** Keys changed here that the server has not received yet. */
  dirty: string[];
  /** A fingerprint of each key's value when it was last in step with the server. */
  hashes: Record<string, string>;
  /** When each key was last sent or received. */
  syncedAt: Record<string, number>;
}

/**
 * Keeps a server's copy of the saved data in step with this device.
 *
 * The browser's storage stays the source the app reads and writes, so the app is instant and works
 * offline. The engine is a courier: it sends what changed here (naming the revision it last saw, so
 * the server can refuse a stale write), and brings back what changed elsewhere. When both sides
 * changed the same key, it stops and asks the person, because it cannot merge two versions.
 */
export class SyncEngine {
  private ledger: Ledger;
  private conflicts = new Map<string, Conflict>();
  private pushTimer: ReturnType<typeof setTimeout> | undefined;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private pollTimer: ReturnType<typeof setInterval> | undefined;
  private running: Promise<void> | undefined;
  private again = false;
  private stopped = false;
  private cleanups: Array<() => void> = [];
  private deps: EngineDeps;

  constructor(deps: EngineDeps) {
    this.deps = deps;
    this.ledger = this.loadLedger();
  }

  // --- what the adapter asks -------------------------------------------------------------

  revisionOf(key: string): number | undefined {
    return this.ledger.revisions[key];
  }

  /** A key was just saved here. Remember it and send it soon. */
  markDirty(key: string, value: string) {
    if (this.stopped || !this.deps.keys.some((k) => k.key === key)) return;
    if (this.ledger.hashes[key] === fingerprint(value) && !this.ledger.dirty.includes(key)) return;
    if (!this.ledger.dirty.includes(key)) this.ledger.dirty.push(key);
    this.saveLedger();
    this.publish({}); // the "waiting to be sent" count goes up
    this.schedulePush();
  }

  // --- life cycle ------------------------------------------------------------------------

  /** Does the first sync, then keeps going: on a timer, when the tab is shown, when the network returns. */
  async start() {
    await this.syncNow();
    if (this.stopped || typeof window === "undefined") return;

    const onVisible = () => document.visibilityState === "visible" && void this.syncNow();
    const onOnline = () => void this.syncNow();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onOnline);
    window.addEventListener("online", onOnline);
    this.cleanups.push(
      () => document.removeEventListener("visibilitychange", onVisible),
      () => window.removeEventListener("focus", onOnline),
      () => window.removeEventListener("online", onOnline)
    );
    this.pollTimer = setInterval(() => void this.syncNow(), this.deps.pollMs ?? 60_000);
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.pushTimer);
    clearTimeout(this.retryTimer);
    clearInterval(this.pollTimer);
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups = [];
  }

  /** Forgets everything it knew about this account (on sign-out). */
  forget() {
    this.stop();
    this.deps.bookkeeping.removeItem(LEDGER_KEY);
    useSync.setState({ status: "local", conflicts: [], documents: [], pending: 0, problem: null, lastSyncAt: null });
  }

  // --- the sync itself -------------------------------------------------------------------

  /** One round: bring news in, then send what changed here. Rounds never overlap. */
  syncNow(): Promise<void> {
    if (this.stopped) return Promise.resolve();
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.round().finally(() => {
      this.running = undefined;
      if (this.again && !this.stopped) {
        this.again = false;
        void this.syncNow();
      }
    });
    return this.running;
  }

  private async round() {
    this.publish({ status: "syncing" });
    try {
      await this.pull();
      await this.pushDirty();
      this.publish({ status: this.conflicts.size ? "conflict" : "synced", lastSyncAt: Date.now() });
    } catch (error) {
      this.handleFailure(error);
    }
  }

  private handleFailure(error: unknown) {
    if (error instanceof ApiError && error.code === "unauthorized") {
      this.deps.onUnauthorized?.();
      return;
    }
    const offline = error instanceof ApiError && (error.code === "network" || error.code === "mixed_content");
    this.publish({ status: offline ? "offline" : "error" });
    // What is still unsent stays marked, and goes out on the next try.
    clearTimeout(this.retryTimer);
    if (!this.stopped) this.retryTimer = setTimeout(() => void this.syncNow(), this.deps.retryMs ?? 15_000);
  }

  private async pull() {
    const { documents } = await this.deps.api.pull();
    const { storage } = this.deps;

    for (const { key, version, label } of this.deps.keys) {
      const server = documents[key];
      const local = storage.getItem(key);
      const base = this.ledger.revisions[key];
      const hasBase = base !== undefined;

      if (!server) {
        // The server has nothing for this key. If we have something, it is ours to send.
        if (local !== null) {
          this.ledger.revisions[key] = 0;
          this.markForPush(key);
        }
        continue;
      }

      if (server.version > version) {
        this.publish({ problem: "app_outdated" }); // newer than this app understands: leave it alone
        continue;
      }

      const localValue = local === null ? undefined : tryParse(local);
      const localIsEmpty = local === null || (!hasBase && localValue !== undefined && !!this.deps.isDefault?.(key, localValue.value));

      if (localIsEmpty) {
        await this.takeServer(key, server);
        continue;
      }

      if (!hasBase) {
        // First meeting between this device's copy and the server's.
        if (sameData(local as string, server.payload)) {
          this.adopt(key, server, local as string);
        } else if (this.deps.isDefault?.(key, server.payload)) {
          // The server only has defaults and this device has real data: send ours over them.
          this.ledger.revisions[key] = server.revision;
          this.markForPush(key);
        } else {
          this.conflicts.set(key, { key, label, server });
        }
        continue;
      }

      if (server.revision === base) continue; // nothing new there

      if (this.ledger.dirty.includes(key) || server.revision < base) {
        this.conflicts.set(key, { key, label, server }); // both sides moved
      } else {
        await this.takeServer(key, server);
      }
    }
    this.saveLedger();
  }

  private markForPush(key: string) {
    if (!this.ledger.dirty.includes(key)) this.ledger.dirty.push(key);
  }

  private adopt(key: string, server: ServerDocument, localText: string) {
    this.ledger.revisions[key] = server.revision;
    this.ledger.hashes[key] = fingerprint(localText);
    this.ledger.syncedAt[key] = Date.now();
    this.ledger.dirty = this.ledger.dirty.filter((k) => k !== key);
  }

  /** Replaces the local copy with the server's, and has the app read it. */
  private async takeServer(key: string, server: ServerDocument) {
    const text = JSON.stringify(server.payload);
    this.deps.storage.setItem(key, text);
    this.ledger.revisions[key] = server.revision;
    this.ledger.hashes[key] = fingerprint(text);
    this.ledger.syncedAt[key] = Date.now();
    this.ledger.dirty = this.ledger.dirty.filter((k) => k !== key);
    this.conflicts.delete(key);
    this.saveLedger();
    await this.deps.applyRemote(key);
  }

  private async pushDirty() {
    for (const key of [...this.ledger.dirty]) {
      if (this.conflicts.has(key)) continue;

      const text = this.deps.storage.getItem(key);
      const parsed = text === null ? undefined : tryParse(text);
      const known = this.deps.keys.find((k) => k.key === key);
      if (text === null || !parsed || parsed.value === null || !known) {
        this.ledger.dirty = this.ledger.dirty.filter((k) => k !== key); // nothing usable to send
        continue;
      }

      try {
        const { revision } = await this.deps.api.push(key, parsed.value, known.version, this.ledger.revisions[key] ?? 0);
        this.ledger.revisions[key] = revision;
        this.ledger.hashes[key] = fingerprint(text);
        this.ledger.syncedAt[key] = Date.now();
        // If it changed again while the request was on its way, it stays marked for the next round.
        if (this.deps.storage.getItem(key) === text) this.ledger.dirty = this.ledger.dirty.filter((k) => k !== key);
      } catch (error) {
        if (error instanceof ApiError && error.code === "revision_conflict") {
          if (error.current) this.conflicts.set(key, { key, label: known.label, server: error.current });
          else this.ledger.revisions[key] = 0; // the server lost it: send it again as new
          continue;
        }
        this.saveLedger();
        throw error;
      }
    }
    this.saveLedger();
  }

  // --- the person decides ----------------------------------------------------------------

  /** Settles one conflict: keep the server's version or send this device's. */
  async resolve(key: string, choice: "server" | "local") {
    const conflict = this.conflicts.get(key);
    if (!conflict) return;

    if (choice === "server") {
      await this.takeServer(key, conflict.server);
    } else {
      // Name the server's revision as the base, so the write goes through and replaces it.
      this.ledger.revisions[key] = conflict.server.revision;
      this.markForPush(key);
      this.conflicts.delete(key);
      this.saveLedger();
    }
    this.publish({ status: this.conflicts.size ? "conflict" : "syncing" });
    await this.syncNow();
  }

  async resolveAll(choice: "server" | "local") {
    for (const key of [...this.conflicts.keys()]) await this.resolve(key, choice);
  }

  // --- bookkeeping -----------------------------------------------------------------------

  private schedulePush() {
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => void this.syncNow(), this.deps.debounceMs ?? 800);
  }

  private publish(change: Partial<{ status: SyncStatus; lastSyncAt: number | null; problem: string | null; conflicts: Conflict[] }>) {
    useSync.setState({
      ...change,
      conflicts: change.conflicts ?? [...this.conflicts.values()],
      documents: this.syncedDocuments(),
      pending: this.ledger.dirty.length,
    });
  }

  /** The keys the server is known to have a current copy of, for the screen. */
  private syncedDocuments(): SyncedDocument[] {
    return this.deps.keys
      .filter(({ key }) => (this.ledger.revisions[key] ?? 0) > 0 && this.ledger.syncedAt[key] !== undefined)
      .map(({ key, label }) => ({ key, label, revision: this.ledger.revisions[key] as number, at: this.ledger.syncedAt[key] as number }));
  }

  private loadLedger(): Ledger {
    const fresh: Ledger = { identity: this.deps.identity, revisions: {}, dirty: [], hashes: {}, syncedAt: {} };
    const raw = this.deps.bookkeeping.getItem(LEDGER_KEY);
    const parsed = raw ? tryParse(raw) : undefined;
    const saved = parsed?.value as Ledger | undefined;
    return saved && saved.identity === this.deps.identity ? { ...fresh, ...saved } : fresh;
  }

  private saveLedger() {
    this.deps.bookkeeping.setItem(LEDGER_KEY, JSON.stringify(this.ledger));
  }
}
