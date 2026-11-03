import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import type { Config } from "../config.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/** Login tokens last two weeks; the client signs in again when one expires (there is no refresh). */
export const TOKEN_LIFETIME = "14d";

export const authPlugin = (config: Config) =>
  fp(async (app) => {
    await app.register(fastifyJwt, { secret: config.JWT_SECRET, sign: { expiresIn: TOKEN_LIFETIME } });

    app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        await reply.code(401).send({ error: "unauthorized", message: "Sign in again." });
      }
    });
  });
