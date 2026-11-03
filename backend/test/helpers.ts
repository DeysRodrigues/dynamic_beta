import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { inject } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { createDb } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";

/**
 * An app wired to its own, freshly migrated database inside the shared test container, so test
 * files can run in parallel without seeing each other's data.
 */
export async function createTestApp(env: Record<string, string> = {}) {
  const admin = postgres(inject("pgAdminUrl"), { max: 1 });
  const name = `t_${randomBytes(6).toString("hex")}`;
  await admin.unsafe(`CREATE DATABASE ${name}`);
  await admin.end();

  const url = new URL(inject("pgAdminUrl"));
  url.pathname = `/${name}`;

  const config = loadConfig({
    DATABASE_URL: url.toString(),
    JWT_SECRET: "test-secret-".padEnd(40, "x"),
    NODE_ENV: "test",
    AUTH_RATE_LIMIT_PER_MINUTE: "1000",
    ...env,
  });

  const { db, client } = createDb(config.DATABASE_URL);
  await runMigrations(db);
  const app = await buildApp(config, db);

  return {
    app,
    db,
    config,
    async close() {
      await app.close();
      await client.end();
    },
  };
}

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;

/** Registers an account and returns its token, for tests that just need to be signed in. */
export async function signUp(app: TestApp["app"], email = "ana@example.com", password = "correct horse battery") {
  const res = await app.inject({ method: "POST", url: "/auth/register", payload: { email, password } });
  return { token: res.json().token as string, id: res.json().user.id as string, email, password };
}

export const bearer = (token: string) => ({ authorization: `Bearer ${token}` });
