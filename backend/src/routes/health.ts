import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  // Docker polls this every few seconds; keep it out of the logs.
  app.get("/health", { logLevel: "silent" }, async () => ({ status: "ok" }));
}
