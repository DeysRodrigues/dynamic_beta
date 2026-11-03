import { and, eq, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { documents } from "../db/schema.js";

/** The biggest saved document the server accepts, in bytes of its JSON. */
export const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;

const keyParam = z.object({ key: z.string().regex(/^[a-z0-9-]{1,64}$/, "A key is 1 to 64 lowercase letters, digits or hyphens.") });

const writeBody = z.object({
  // Any JSON value except null: the app never saves null, and a SQL NULL would not fit the column.
  payload: z.json().refine((value) => value !== null, "The payload cannot be null."),
  version: z.number().int().min(0).max(10_000),
  /** The revision of this key that the client last saw; 0 when it has never synced it. */
  baseRevision: z.number().int().min(0),
});

// The payload is read as JSON text and decoded here. Letting the driver and Drizzle both decode it
// parses twice, which turns the string "3" into the number 3.
const columns = {
  key: documents.key,
  payloadText: sql<string>`${documents.payload}::text`,
  version: documents.version,
  revision: documents.revision,
  updatedAt: documents.updatedAt,
};

const toDocument = (row: { payloadText: string; version: number; revision: number; updatedAt: Date }) => ({
  payload: JSON.parse(row.payloadText) as unknown,
  version: row.version,
  revision: row.revision,
  updatedAt: row.updatedAt.toISOString(),
});

export function syncRoutes(db: Db) {
  return async (app: FastifyInstance) => {
    const typed = app.withTypeProvider<ZodTypeProvider>();

    typed.get("/sync", { onRequest: [app.authenticate] }, async (request) => {
      const rows = await db.select(columns).from(documents).where(eq(documents.userId, request.user.sub));
      return { documents: Object.fromEntries(rows.map((row) => [row.key, toDocument(row)])) };
    });

    typed.put("/sync/:key", { onRequest: [app.authenticate], schema: { params: keyParam, body: writeBody } }, async (request, reply) => {
      const userId = request.user.sub;
      const { key } = request.params;
      const { payload, version, baseRevision } = request.body;

      if (Buffer.byteLength(JSON.stringify(payload)) > MAX_PAYLOAD_BYTES) {
        return reply.code(413).send({ error: "payload_too_large", message: "This document is too big to sync." });
      }

      // The write only happens if the stored revision is the one the client named, and the check
      // and the write are one statement, so two clients racing on the same revision cannot both win.
      // The payload goes in as JSON text cast to jsonb. Handing the value to the driver would store a
      // string payload (such as "3") as the number 3, and fail outright on text like "olá".
      const json = sql`${JSON.stringify(payload)}::jsonb`;

      const written =
        baseRevision === 0
          ? await db
              .insert(documents)
              .values({ userId, key, payload: json, version, revision: 1 })
              .onConflictDoNothing({ target: [documents.userId, documents.key] })
              .returning({ revision: documents.revision })
          : await db
              .update(documents)
              .set({ payload: json, version, revision: sql`${documents.revision} + 1`, updatedAt: sql`now()` })
              .where(and(eq(documents.userId, userId), eq(documents.key, key), eq(documents.revision, baseRevision)))
              .returning({ revision: documents.revision });

      if (written[0]) return { revision: written[0].revision };

      // Someone else wrote first (or the document is gone): hand back what is there, so the
      // client can ask the person which version to keep.
      const [current] = await db.select(columns).from(documents).where(and(eq(documents.userId, userId), eq(documents.key, key))).limit(1);
      return reply.code(409).send({
        error: "revision_conflict",
        message: "The server has a different version of this document.",
        current: current ? toDocument(current) : null,
      });
    });

    typed.delete("/sync", { onRequest: [app.authenticate] }, async (request, reply) => {
      await db.delete(documents).where(eq(documents.userId, request.user.sub));
      return reply.code(204).send();
    });
  };
}
