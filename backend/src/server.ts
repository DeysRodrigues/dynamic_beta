import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";

const config = loadConfig();
const { db, client } = createDb(config.DATABASE_URL);

await runMigrations(db);
const app = await buildApp(config, db);

try {
  await app.listen({ port: config.PORT, host: config.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

// Finish the requests in flight when Docker asks the container to stop.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void app.close().then(() => client.end()).then(() => process.exit(0));
  });
}
