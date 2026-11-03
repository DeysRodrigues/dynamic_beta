import Fastify, { type FastifyInstance } from "fastify";
import type { Config } from "./config.js";
import { healthRoutes } from "./routes/health.js";

export async function buildApp(config: Config): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.NODE_ENV === "test" ? false : { level: "info" },
    // A saved document can be a couple of MB; leave room for the envelope around it.
    bodyLimit: 3 * 1024 * 1024,
  });

  await app.register(healthRoutes);
  return app;
}
