import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../auth/password.js";
import type { Config } from "../config.js";
import type { Db } from "../db/client.js";
import { users } from "../db/schema.js";

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});

export function authRoutes(config: Config, db: Db) {
  return async (app: FastifyInstance) => {
    const typed = app.withTypeProvider<ZodTypeProvider>();
    const rateLimit = { max: config.AUTH_RATE_LIMIT_PER_MINUTE, timeWindow: "1 minute" };

    typed.post("/auth/register", { schema: { body: credentials }, config: { rateLimit } }, async (request, reply) => {
      if (!config.ALLOW_REGISTRATION) {
        return reply.code(403).send({ error: "registration_disabled", message: "This server is not accepting new accounts." });
      }

      const { email, password } = request.body;
      const [created] = await db
        .insert(users)
        .values({ email, passwordHash: await hashPassword(password) })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id, email: users.email });

      if (!created) return reply.code(409).send({ error: "email_taken", message: "There is already an account with this e-mail." });

      const token = await reply.jwtSign({ sub: created.id });
      return reply.code(201).send({ token, user: created });
    });

    typed.post("/auth/login", { schema: { body: credentials }, config: { rateLimit } }, async (request, reply) => {
      const { email, password } = request.body;
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      // One answer for "no such account" and "wrong password", so it cannot be used to find accounts.
      if (!(await verifyPassword(user?.passwordHash, password)) || !user) {
        return reply.code(401).send({ error: "invalid_credentials", message: "Wrong e-mail or password." });
      }

      const token = await reply.jwtSign({ sub: user.id });
      return { token, user: { id: user.id, email: user.email } };
    });

    typed.get("/auth/me", { onRequest: [app.authenticate] }, async (request, reply) => {
      const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, request.user.sub)).limit(1);
      // The token is valid but the account is gone (deleted): treat it as signed out.
      if (!user) return reply.code(401).send({ error: "unauthorized", message: "Sign in again." });
      return user;
    });
  };
}
