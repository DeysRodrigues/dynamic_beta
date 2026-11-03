import { describe, it, expect, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp(loadConfig({ DATABASE_URL: "postgres://x", JWT_SECRET: "x".repeat(32), NODE_ENV: "test" }));
  });
  afterAll(() => app.close());

  it("responde 200 com status ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("rota que não existe dá 404", async () => {
    expect((await app.inject({ method: "GET", url: "/nao-existe" })).statusCode).toBe(404);
  });
});
