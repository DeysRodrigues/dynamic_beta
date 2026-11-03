import type { FetchFn } from "./api";

interface Doc {
  payload: unknown;
  version: number;
  revision: number;
  updatedAt: string;
}

/**
 * A stand-in for the DynaBox server that follows the same rules as the real one (the backend's own
 * tests prove those): accounts, bearer tokens, and a revision check on every write. It also refuses
 * what the real one refuses, such as a JSON content type with no body.
 */
export function createFakeServer(options: { registration?: boolean; onlyUnder?: string; rootBlocked?: boolean } = {}) {
  const users = new Map<string, { id: string; password: string }>();
  const docsByUser = new Map<string, Map<string, Doc>>();
  const state = {
    down: false,
    registration: options.registration ?? true,
    /** Runs right before a write is applied, to simulate another device writing first. */
    beforePut: undefined as undefined | ((key: string) => void),
    requests: [] as { method: string; path: string; headers: Record<string, string>; body?: unknown }[],
    inFlight: 0,
    maxInFlight: 0,
    revokedTokens: new Set<string>(),
  };

  const docsOf = (userId: string) => {
    let docs = docsByUser.get(userId);
    if (!docs) docsByUser.set(userId, (docs = new Map()));
    return docs;
  };

  const json = (status: number, body?: unknown) =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  const fetchFn: FetchFn = async (input, init = {}) => {
    state.inFlight++;
    state.maxInFlight = Math.max(state.maxInFlight, state.inFlight);
    try {
      await Promise.resolve();
      if (state.down) throw new TypeError("Failed to fetch");

      const url = new URL(input, "http://server.test");
      // Like the Docker setup: the API answers only under a prefix, and the root serves the app.
      if (options.onlyUnder && !url.pathname.startsWith(`${options.onlyUnder}/`)) {
        // `rootBlocked` is what a browser reports when the page is on another origin and the root has no CORS headers.
        if (options.rootBlocked) throw new TypeError("Failed to fetch");
        return new Response("<!DOCTYPE html><html></html>", { status: 200, headers: { "content-type": "text/html" } });
      }
      const path = url.pathname.replace(/^\/api/, "");
      const method = (init.method ?? "GET").toUpperCase();
      const headers = Object.fromEntries(Object.entries((init.headers as Record<string, string>) ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
      const body = init.body ? JSON.parse(init.body as string) : undefined;
      state.requests.push({ method, path, headers, body });

      // The real server rejects a JSON content type with no body unless told otherwise; this one
      // does too, so the client must not send one.
      if (headers["content-type"] && init.body === undefined && method !== "GET") return json(400, { error: "invalid_json" });

      if (method === "GET" && path === "/health") return json(200, { status: "ok", service: "dynabox-api", registration: state.registration });

      if (method === "POST" && (path === "/auth/register" || path === "/auth/login")) {
        const email = String(body?.email ?? "").toLowerCase();
        const existing = users.get(email);
        if (path === "/auth/register") {
          if (!state.registration) return json(403, { error: "registration_disabled" });
          if (existing) return json(409, { error: "email_taken" });
          const created = { id: `user-${users.size + 1}`, password: body.password };
          users.set(email, created);
          return json(201, { token: `token-${created.id}`, user: { id: created.id, email } });
        }
        if (!existing || existing.password !== body.password) return json(401, { error: "invalid_credentials" });
        return json(200, { token: `token-${existing.id}`, user: { id: existing.id, email } });
      }

      const bearer = headers.authorization?.replace(/^Bearer /, "");
      const candidate = bearer?.startsWith("token-") ? bearer.slice("token-".length) : undefined;
      const known = candidate !== undefined && [...users.values()].some((user) => user.id === candidate);
      const userId = known && bearer && !state.revokedTokens.has(bearer) ? candidate : undefined;
      if (!userId) return json(401, { error: "unauthorized" });
      const docs = docsOf(userId);

      if (method === "GET" && path === "/sync") {
        return json(200, { documents: Object.fromEntries(docs) });
      }

      if (method === "DELETE" && path === "/sync") {
        docs.clear();
        return json(204);
      }

      const match = path.match(/^\/sync\/([a-z0-9-]{1,64})$/);
      if (method === "PUT" && match) {
        const key = match[1] as string;
        state.beforePut?.(key);
        const current = docs.get(key);
        const base = body.baseRevision as number;
        if (!current && base === 0) {
          docs.set(key, { payload: body.payload, version: body.version, revision: 1, updatedAt: new Date().toISOString() });
          return json(200, { revision: 1 });
        }
        if (current && current.revision === base) {
          docs.set(key, { payload: body.payload, version: body.version, revision: base + 1, updatedAt: new Date().toISOString() });
          return json(200, { revision: base + 1 });
        }
        return json(409, { error: "revision_conflict", current: current ?? null });
      }

      return json(404, { error: "not_found" });
    } finally {
      state.inFlight--;
    }
  };

  return {
    fetchFn,
    state,
    /** Seeds a document for an account, as if another device had saved it. */
    seed(userId: string, key: string, payload: unknown, version = 1, revision = 1) {
      docsOf(userId).set(key, { payload, version, revision, updatedAt: new Date().toISOString() });
    },
    /** Another device writes a newer version. */
    bump(userId: string, key: string, payload: unknown) {
      const current = docsOf(userId).get(key);
      docsOf(userId).set(key, { payload, version: current?.version ?? 1, revision: (current?.revision ?? 0) + 1, updatedAt: new Date().toISOString() });
    },
    docs: (userId: string) => docsOf(userId),
    addUser(email: string, password: string) {
      const id = `user-${users.size + 1}`;
      users.set(email, { id, password });
      return id;
    },
  };
}

export type FakeServer = ReturnType<typeof createFakeServer>;
