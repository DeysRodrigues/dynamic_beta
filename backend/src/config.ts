import { z } from "zod";

const boolean = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const schema = z.object({
  /** Where to listen. */
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),
  /** The Postgres connection string. */
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Signs the login tokens. No default on purpose: a known secret would let anyone forge a login. */
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  /** Whether anyone can create an account. Turn it off on a server that is already set up. */
  ALLOW_REGISTRATION: boolean.default(true),
  /** Origins allowed to call the API from a browser, comma separated. `*` allows any. */
  CORS_ORIGINS: z.string().default("*"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Config = z.infer<typeof schema>;

/** Reads and checks the environment, failing with a readable list of what is wrong. */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid configuration:\n${problems.join("\n")}`);
  }
  return parsed.data;
}
