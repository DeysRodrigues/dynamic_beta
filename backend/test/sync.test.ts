import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { documents, users } from "../src/db/schema.js";
import { bearer, createTestApp, signUp, type TestApp } from "./helpers.js";

let t: TestApp;
beforeAll(async () => { t = await createTestApp(); });
afterAll(() => t.close());

const put = (token: string, key: string, body: object) =>
  t.app.inject({ method: "PUT", url: `/sync/${key}`, headers: bearer(token), payload: body });
const get = (token: string) => t.app.inject({ method: "GET", url: "/sync", headers: bearer(token) });

const doc = (payload: unknown, baseRevision: number, version = 1) => ({ payload, version, baseRevision });

describe("sem estar logado", () => {
  it.each([
    ["GET", "/sync"],
    ["PUT", "/sync/tasks-storage"],
    ["DELETE", "/sync"],
  ])("%s %s dá 401", async (method, url) => {
    const res = await t.app.inject({ method: method as "GET", url, payload: method === "PUT" ? doc({}, 0) : undefined });
    expect(res.statusCode).toBe(401);
  });
});

describe("escrever e ler", () => {
  it("o primeiro envio (base 0) cria o documento na revisão 1, e o GET devolve", async () => {
    const { token } = await signUp(t.app, "criar@example.com");
    const state = { state: { tasks: [{ id: "1", description: "Estudar ação ✓" }] }, version: 1 };

    const res = await put(token, "tasks-storage", doc(state, 0));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ revision: 1 });

    const list = (await get(token)).json();
    expect(Object.keys(list.documents)).toEqual(["tasks-storage"]);
    expect(list.documents["tasks-storage"]).toMatchObject({ payload: state, version: 1, revision: 1 });
    expect(list.documents["tasks-storage"].updatedAt).toMatch(/^\d{4}-\d\d-\d\dT/);
  });

  it("com a base certa, troca o conteúdo e sobe a revisão", async () => {
    const { token } = await signUp(t.app, "subir@example.com");
    await put(token, "notes", doc({ text: "a" }, 0));
    expect((await put(token, "notes", doc({ text: "b" }, 1))).json()).toEqual({ revision: 2 });
    expect((await put(token, "notes", doc({ text: "c" }, 2, 3))).json()).toEqual({ revision: 3 });

    const stored = (await get(token)).json().documents.notes;
    expect(stored).toMatchObject({ payload: { text: "c" }, version: 3, revision: 3 });
  });

  it("um usuário novo começa sem documentos", async () => {
    const { token } = await signUp(t.app, "vazio@example.com");
    expect((await get(token)).json()).toEqual({ documents: {} });
  });

  it.each([
    ["objeto", { a: 1, b: [1, 2, { c: null }] }],
    ["lista", [1, "dois", false]],
    ["texto que parece número", "3"],
    ["texto comum", "olá, mundo"],
    ["texto que parece JSON", '{"a":1}'],
    ["texto vazio", ""],
    ["número", 3],
    ["booleano", false],
  ])("aceita um payload do tipo %s e devolve igual", async (_name, payload) => {
    const { token } = await signUp(t.app, `tipo-${Math.random()}@example.com`);
    expect((await put(token, "w-water-cups", doc(payload, 0))).statusCode).toBe(200);
    expect((await get(token)).json().documents["w-water-cups"].payload).toEqual(payload);
  });

  it("recusa payload null, versão ou base inválidas com 400", async () => {
    const { token } = await signUp(t.app, "invalido@example.com");
    for (const body of [
      doc(null, 0),
      { version: 1, baseRevision: 0 },
      { payload: {}, version: -1, baseRevision: 0 },
      { payload: {}, version: 1.5, baseRevision: 0 },
      { payload: {}, version: 1, baseRevision: -1 },
      { payload: {}, version: 1 },
    ]) {
      expect((await put(token, "k", body)).statusCode, JSON.stringify(body)).toBe(400);
    }
  });
});

describe("conflito de revisão", () => {
  it("base velha dá 409, devolve o que está no servidor e não altera nada", async () => {
    const { token } = await signUp(t.app, "velha@example.com");
    await put(token, "k", doc({ v: 1 }, 0));
    await put(token, "k", doc({ v: 2 }, 1));

    const res = await put(token, "k", doc({ v: "do outro aparelho" }, 1));
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ error: "revision_conflict", current: { payload: { v: 2 }, revision: 2, version: 1 } });
    expect((await get(token)).json().documents.k.payload).toEqual({ v: 2 });
  });

  it("base 0 num documento que já existe também é conflito", async () => {
    const { token } = await signUp(t.app, "zero@example.com");
    await put(token, "k", doc({ v: 1 }, 0));
    const res = await put(token, "k", doc({ v: 2 }, 0));
    expect(res.statusCode).toBe(409);
    expect(res.json().current.payload).toEqual({ v: 1 });
  });

  it("base à frente do servidor é conflito", async () => {
    const { token } = await signUp(t.app, "frente@example.com");
    await put(token, "k", doc({ v: 1 }, 0));
    expect((await put(token, "k", doc({ v: 2 }, 5))).statusCode).toBe(409);
  });

  it("base maior que zero num documento que não existe: 409 com current nulo", async () => {
    const { token } = await signUp(t.app, "sumiu@example.com");
    const res = await put(token, "k", doc({ v: 1 }, 3));
    expect(res.statusCode).toBe(409);
    expect(res.json().current).toBeNull();
  });

  it("depois do 409, o cliente refaz com a revisão que veio e consegue", async () => {
    const { token } = await signUp(t.app, "refaz@example.com");
    await put(token, "k", doc({ v: 1 }, 0));
    const conflict = await put(token, "k", doc({ v: "meu" }, 0));
    const retry = await put(token, "k", doc({ v: "meu" }, conflict.json().current.revision));
    expect(retry.statusCode).toBe(200);
    expect(retry.json()).toEqual({ revision: 2 });
  });

  it("duas escritas ao mesmo tempo na mesma revisão: uma ganha, a outra leva 409", async () => {
    const { token } = await signUp(t.app, "corrida@example.com");
    await put(token, "k", doc({ v: 0 }, 0));

    const results = await Promise.all(Array.from({ length: 6 }, (_, i) => put(token, "k", doc({ v: i + 1 }, 1))));
    const statuses = results.map((r) => r.statusCode).sort();
    expect(statuses).toEqual([200, 409, 409, 409, 409, 409]);

    const stored = (await get(token)).json().documents.k;
    expect(stored.revision).toBe(2);
    expect(results.find((r) => r.statusCode === 200)).toBeDefined();
  });

  it("duas criações ao mesmo tempo (base 0): uma ganha", async () => {
    const { token } = await signUp(t.app, "criacao@example.com");
    const results = await Promise.all([put(token, "k", doc({ a: 1 }, 0)), put(token, "k", doc({ a: 2 }, 0))]);
    expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
  });
});

describe("cada conta vê só o que é seu", () => {
  it("documentos e revisões são separados entre usuários, mesmo com a mesma chave", async () => {
    const ana = await signUp(t.app, "isola-ana@example.com");
    const bia = await signUp(t.app, "isola-bia@example.com");

    await put(ana.token, "tasks-storage", doc({ dono: "ana" }, 0));
    await put(ana.token, "tasks-storage", doc({ dono: "ana", mais: true }, 1));
    expect((await put(bia.token, "tasks-storage", doc({ dono: "bia" }, 0))).json()).toEqual({ revision: 1 });

    expect((await get(ana.token)).json().documents["tasks-storage"]).toMatchObject({ payload: { dono: "ana", mais: true }, revision: 2 });
    expect((await get(bia.token)).json().documents["tasks-storage"]).toMatchObject({ payload: { dono: "bia" }, revision: 1 });
  });

  it("o token de uma conta não consegue sobrescrever o documento de outra", async () => {
    const ana = await signUp(t.app, "alvo-ana@example.com");
    const bia = await signUp(t.app, "alvo-bia@example.com");
    await put(ana.token, "k", doc({ segredo: true }, 0));

    const attack = await put(bia.token, "k", doc({ invadido: true }, 1)); // base 1 existe só na conta da Ana
    expect(attack.statusCode).toBe(409);
    expect(attack.json().current).toBeNull();
    expect((await get(ana.token)).json().documents.k.payload).toEqual({ segredo: true });
  });
});

describe("chave do documento", () => {
  it.each(["tasks-storage", "w-water-cups", "a", "x".repeat(64), "0-9"])("aceita %s", async (key) => {
    const { token } = await signUp(t.app, `chave-${Math.random()}@example.com`);
    expect((await put(token, key, doc({}, 0))).statusCode).toBe(200);
  });

  it.each(["Tasks", "com espaco", "com_underscore", "x".repeat(65), "ponto.ponto", "%2e%2e"])("recusa %j com 400", async (key) => {
    const { token } = await signUp(t.app, `ruim-${Math.random()}@example.com`);
    expect((await put(token, encodeURIComponent(key), doc({}, 0))).statusCode).toBe(400);
  });
});

describe("tamanho", () => {
  it("um documento acima de 2 MB leva 413 e não é salvo", async () => {
    const { token, id } = await signUp(t.app, "grande@example.com");
    const res = await put(token, "k", doc({ blob: "x".repeat(2.2 * 1024 * 1024) }, 0));
    expect(res.statusCode).toBe(413);
    expect(await t.db.select().from(documents).where(eq(documents.userId, id))).toHaveLength(0);
  });

  it("um documento de 1 MB passa", async () => {
    const { token } = await signUp(t.app, "medio@example.com");
    expect((await put(token, "k", doc({ blob: "x".repeat(1024 * 1024) }, 0))).statusCode).toBe(200);
  });

  it("um corpo acima do limite do servidor também leva 413", async () => {
    const { token } = await signUp(t.app, "enorme@example.com");
    const res = await put(token, "k", doc({ blob: "x".repeat(3.5 * 1024 * 1024) }, 0));
    expect(res.statusCode).toBe(413);
  });
});

describe("DELETE /sync", () => {
  it("apaga os documentos da conta, e só os dela", async () => {
    const ana = await signUp(t.app, "del-ana@example.com");
    const bia = await signUp(t.app, "del-bia@example.com");
    await put(ana.token, "a", doc({}, 0));
    await put(ana.token, "b", doc({}, 0));
    await put(bia.token, "a", doc({ fica: true }, 0));

    const res = await t.app.inject({ method: "DELETE", url: "/sync", headers: bearer(ana.token) });
    expect(res.statusCode).toBe(204);
    expect((await get(ana.token)).json()).toEqual({ documents: {} });
    expect((await get(bia.token)).json().documents.a.payload).toEqual({ fica: true });
  });

  it("aceita o DELETE de um navegador, que manda Content-Type JSON sem corpo", async () => {
    const { token } = await signUp(t.app, "navegador@example.com");
    await put(token, "k", doc({}, 0));
    const res = await t.app.inject({ method: "DELETE", url: "/sync", headers: { ...bearer(token), "content-type": "application/json" } });
    expect(res.statusCode).toBe(204);
  });

  it("JSON quebrado continua sendo 400, e corpo vazio num PUT também", async () => {
    const { token } = await signUp(t.app, "quebrado@example.com");
    const headers = { ...bearer(token), "content-type": "application/json" };
    const broken = await t.app.inject({ method: "PUT", url: "/sync/k", headers, payload: "{nao é json" });
    expect(broken.statusCode).toBe(400);
    const empty = await t.app.inject({ method: "PUT", url: "/sync/k", headers, payload: "" });
    expect(empty.statusCode).toBe(400);
  });

  it("depois de apagar, o cliente começa de novo na base 0", async () => {
    const { token } = await signUp(t.app, "recomeca@example.com");
    await put(token, "k", doc({ v: 1 }, 0));
    await t.app.inject({ method: "DELETE", url: "/sync", headers: bearer(token) });
    expect((await put(token, "k", doc({ v: 2 }, 0))).json()).toEqual({ revision: 1 });
  });
});

describe("no banco", () => {
  it("apagar a conta apaga os documentos dela (cascata)", async () => {
    const { token, id } = await signUp(t.app, "cascata@example.com");
    await put(token, "k", doc({}, 0));
    await t.db.delete(users).where(eq(users.id, id));
    expect(await t.db.select().from(documents).where(eq(documents.userId, id))).toHaveLength(0);
  });
});
