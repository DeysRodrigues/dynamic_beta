import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "./helpers.js";

describe("GET /health", () => {
  let t: TestApp;
  beforeAll(async () => { t = await createTestApp(); });
  afterAll(() => t.close());

  it("responde 200 com status ok", async () => {
    const res = await t.app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("rota que não existe dá 404", async () => {
    expect((await t.app.inject({ method: "GET", url: "/nao-existe" })).statusCode).toBe(404);
  });

  it("as migrações criaram as tabelas", async () => {
    const res = await t.db.execute("select table_name from information_schema.tables where table_schema = 'public' order by 1" as never);
    expect((res as unknown as { table_name: string }[]).map((r) => r.table_name)).toEqual(expect.arrayContaining(["users", "documents"]));
  });
});
