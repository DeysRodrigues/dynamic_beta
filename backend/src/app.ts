import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { Config } from "./config.js";
import type { Db } from "./db/client.js";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";

export async function buildApp(config: Config, db: Db): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.NODE_ENV === "test" ? false : { level: "info" },
    // A saved document can be a couple of MB; leave room for the envelope around it.
    bodyLimit: 3 * 1024 * 1024,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({
        error: "invalid_request",
        message: "The request is not valid.",
        issues: error.validation.map((issue) => ({ path: issue.instancePath, message: issue.message })),
      });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ error: error.code ?? "bad_request", message: error.message });
    }
    request.log.error(error);
    return reply.code(500).send({ error: "internal", message: "Something went wrong on the server." });
  });

  const origins = config.CORS_ORIGINS === "*" ? true : config.CORS_ORIGINS.split(",").map((origin) => origin.trim());
  await app.register(cors, { origin: origins, methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"] });
  await app.register(rateLimit, { global: false });
  await app.register(authPlugin(config));

  await app.register(healthRoutes);
  await app.register(authRoutes(config, db));
  return app;
}
