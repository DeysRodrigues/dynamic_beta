import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { Db } from "./client.js";

// `drizzle/` sits next to `src/` and `dist/`, so the same path works from both.
const migrationsFolder = new URL("../../drizzle", import.meta.url).pathname;

/**
 * Applies the SQL migrations that have not run yet. Waits for the database a few times, because
 * in a cloud deploy the API can start before Postgres accepts connections.
 */
export async function runMigrations(db: Db, attempts = 15): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await migrate(db, { migrationsFolder });
      return;
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
