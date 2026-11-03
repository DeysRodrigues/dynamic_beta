import type { FastifyInstance } from "fastify";
import type { Config } from "../config.js";

export function healthRoutes(config: Config) {
  return async (app: FastifyInstance) => {
    // Docker polls this every few seconds; keep it out of the logs. The app's "test the
    // connection" button reads it too, to know this is a DynaBox server and whether it lets
    // people create an account. It says nothing else about the server.
    app.get("/health", { logLevel: "silent" }, async () => ({
      status: "ok",
      service: "dynabox-api",
      registration: config.ALLOW_REGISTRATION,
    }));
  };
}
