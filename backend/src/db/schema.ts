import { sql } from "drizzle-orm";
import { bigint, check, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // The app lower-cases the address; this keeps it true even if something else writes here.
    check("users_email_lowercase", sql`${table.email} = lower(${table.email})`),
  ]
);

/**
 * One saved document per user and key: exactly what the browser keeps in `localStorage`, under
 * the same key. The server does not look inside `payload`.
 */
export const documents = pgTable(
  "documents",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    payload: jsonb("payload").notNull(),
    /** The shape of the payload, as the app that wrote it understood it. */
    version: integer("version").notNull(),
    /** Counts the writes of this document; a client must name the one it last saw. */
    revision: bigint("revision", { mode: "number" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.key] })]
);
