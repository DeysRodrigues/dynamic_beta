import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { users } from "../src/db/schema.js";
import { bearer, createTestApp, signUp, type TestApp } from "./helpers.js";

const post = (t: TestApp, url: string, payload: unknown) => t.app.inject({ method: "POST", url, payload: payload as object });

describe("registro", () => {
  let t: TestApp;
  beforeAll(async () => { t = await createTestApp(); });
  afterAll(() => t.close());

  it("cria a conta: 201 com token e usuário, sem devolver a senha nem o hash", async () => {
    const res = await post(t, "/auth/register", { email: "ana@example.com", password: "correct horse" });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({ id: expect.any(String), email: "ana@example.com" });
    expect(JSON.stringify(body)).not.toMatch(/password|argon2/i);
  });

  it("guarda só o hash argon2id, nunca a senha", async () => {
    await post(t, "/auth/register", { email: "hash@example.com", password: "uma senha longa" });
    const [row] = await t.db.select().from(users).where(eq(users.email, "hash@example.com"));
    expect(row?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(row?.passwordHash).not.toContain("uma senha longa");
  });

  it("normaliza o e-mail: espaços e maiúsculas", async () => {
    const res = await post(t, "/auth/register", { email: "  Bia@Example.COM ", password: "senha-bem-longa" });
    expect(res.statusCode).toBe(201);
    expect(res.json().user.email).toBe("bia@example.com");
  });

  it("e-mail repetido dá 409, mesmo escrito de outro jeito", async () => {
    await post(t, "/auth/register", { email: "dup@example.com", password: "senha-bem-longa" });
    const again = await post(t, "/auth/register", { email: "DUP@example.com", password: "outra-senha-longa" });
    expect(again.statusCode).toBe(409);
    expect(again.json().error).toBe("email_taken");
  });

  it.each([
    ["e-mail inválido", { email: "nao-e-email", password: "senha-bem-longa" }],
    ["sem e-mail", { password: "senha-bem-longa" }],
    ["senha curta", { email: "c@example.com", password: "curta" }],
    ["senha enorme", { email: "c@example.com", password: "x".repeat(129) }],
    ["senha que não é texto", { email: "c@example.com", password: 12345678 }],
    ["corpo vazio", {}],
  ])("recusa com 400: %s", async (_name, payload) => {
    const res = await post(t, "/auth/register", payload);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("invalid_request");
  });

  it("aceita senha de 8 e de 128 caracteres", async () => {
    expect((await post(t, "/auth/register", { email: "e8@example.com", password: "12345678" })).statusCode).toBe(201);
    expect((await post(t, "/auth/register", { email: "e128@example.com", password: "x".repeat(128) })).statusCode).toBe(201);
  });
});

describe("registro desligado", () => {
  let t: TestApp;
  beforeAll(async () => { t = await createTestApp({ ALLOW_REGISTRATION: "false" }); });
  afterAll(() => t.close());

  it("responde 403 e não cria conta", async () => {
    const res = await post(t, "/auth/register", { email: "x@example.com", password: "senha-bem-longa" });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe("registration_disabled");
    expect(await t.db.select().from(users)).toHaveLength(0);
  });
});

describe("login", () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await createTestApp();
    await signUp(t.app, "ana@example.com", "correct horse battery");
  });
  afterAll(() => t.close());

  it("entra com e-mail e senha certos e devolve token", async () => {
    const res = await post(t, "/auth/login", { email: "ANA@example.com", password: "correct horse battery" });
    expect(res.statusCode).toBe(200);
    expect(res.json().token).toEqual(expect.any(String));
    expect(res.json().user.email).toBe("ana@example.com");
  });

  it("senha errada e e-mail desconhecido dão a MESMA resposta 401", async () => {
    const wrong = await post(t, "/auth/login", { email: "ana@example.com", password: "senha errada mesmo" });
    const unknown = await post(t, "/auth/login", { email: "ninguem@example.com", password: "senha errada mesmo" });
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(wrong.json()).toEqual(unknown.json());
  });

  it("recusa corpo inválido com 400", async () => {
    expect((await post(t, "/auth/login", { email: "ana@example.com" })).statusCode).toBe(400);
  });
});

describe("limite de tentativas", () => {
  let t: TestApp;
  beforeAll(async () => { t = await createTestApp({ AUTH_RATE_LIMIT_PER_MINUTE: "3" }); });
  afterAll(() => t.close());

  it("depois de 3 tentativas na janela, a 4ª leva 429", async () => {
    const attempt = () => post(t, "/auth/login", { email: "x@example.com", password: "senha-bem-longa" });
    expect((await attempt()).statusCode).toBe(401);
    expect((await attempt()).statusCode).toBe(401);
    expect((await attempt()).statusCode).toBe(401);
    expect((await attempt()).statusCode).toBe(429);
  });
});

describe("GET /auth/me", () => {
  let t: TestApp;
  beforeAll(async () => { t = await createTestApp(); });
  afterAll(() => t.close());

  it("com token válido devolve a conta", async () => {
    const { token, id } = await signUp(t.app);
    const res = await t.app.inject({ method: "GET", url: "/auth/me", headers: bearer(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ id, email: "ana@example.com" });
  });

  it.each([
    ["sem token", {}],
    ["token que não é token", { authorization: "Bearer lixo" }],
    ["esquema errado", { authorization: "Basic abc" }],
  ])("401: %s", async (_name, headers) => {
    const res = await t.app.inject({ method: "GET", url: "/auth/me", headers });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("unauthorized");
  });

  it("recusa um token assinado com outra chave", async () => {
    const { id } = await signUp(t.app, "outra@example.com");
    const forged = await (await createTestApp({ JWT_SECRET: "y".repeat(40) })).app.jwt.sign({ sub: id });
    const res = await t.app.inject({ method: "GET", url: "/auth/me", headers: bearer(forged) });
    expect(res.statusCode).toBe(401);
  });

  it("recusa o token de uma conta que foi apagada", async () => {
    const { token, id } = await signUp(t.app, "apagada@example.com");
    await t.db.delete(users).where(eq(users.id, id));
    const res = await t.app.inject({ method: "GET", url: "/auth/me", headers: bearer(token) });
    expect(res.statusCode).toBe(401);
  });
});

describe("CORS", () => {
  let t: TestApp;
  beforeAll(async () => { t = await createTestApp({ CORS_ORIGINS: "https://dynabox.space, http://localhost:5173" }); });
  afterAll(() => t.close());

  it("libera só as origens configuradas", async () => {
    const ok = await t.app.inject({ method: "OPTIONS", url: "/auth/login", headers: { origin: "https://dynabox.space", "access-control-request-method": "POST" } });
    expect(ok.headers["access-control-allow-origin"]).toBe("https://dynabox.space");
    const bad = await t.app.inject({ method: "OPTIONS", url: "/auth/login", headers: { origin: "https://malvado.example", "access-control-request-method": "POST" } });
    expect(bad.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
