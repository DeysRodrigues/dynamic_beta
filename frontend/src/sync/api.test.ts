import { describe, it, expect, vi } from "vitest";
import { ApiError, createApi, describeError, discoverServer, isBlockedAsMixedContent, normalizeServerUrl, type ApiErrorCode } from "./api";
import { createFakeServer } from "./fakeServer";

describe("normalizeServerUrl", () => {
  it.each([
    ["  http://localhost:8080/api/  ", "http://localhost:8080/api"],
    ["localhost:3000", "http://localhost:3000"],
    ["127.0.0.1:3000/api", "http://127.0.0.1:3000/api"],
    ["meuservidor.com", "https://meuservidor.com"],
    ["https://meuservidor.com///", "https://meuservidor.com"],
    ["http://192.168.0.10:3000", "http://192.168.0.10:3000"],
    ["/api/", "/api"],
    ["   ", ""],
  ])("%j -> %j", (input, expected) => expect(normalizeServerUrl(input)).toBe(expected));
});

describe("isBlockedAsMixedContent", () => {
  it.each([
    ["https:", "http://meuservidor.com", true],
    ["https:", "http://192.168.0.10:3000", true],
    ["https:", "http://localhost:3000", false],
    ["https:", "http://127.0.0.1:8080/api", false],
    ["https:", "https://meuservidor.com", false],
    ["https:", "/api", false],
    ["http:", "http://meuservidor.com", false],
  ])("página %s, servidor %s -> bloqueado=%s", (page, server, blocked) => expect(isBlockedAsMixedContent(server, page)).toBe(blocked));
});

describe("o cliente", () => {
  const make = (server = createFakeServer(), extra: Partial<Parameters<typeof createApi>[0]> = {}) => ({
    server,
    api: createApi({ baseUrl: "http://server.test", fetchFn: server.fetchFn, pageProtocol: "http:", ...extra }),
  });

  it("health reconhece um servidor DynaBox e diz se aceita contas", async () => {
    expect(await make().api.health()).toEqual({ registration: true });
    expect(await make(createFakeServer({ registration: false })).api.health()).toEqual({ registration: false });
  });

  it("recusa um endereço que responde mas não é DynaBox", async () => {
    const fetchFn = async () => new Response(JSON.stringify({ hello: "world" }), { status: 200 });
    const api = createApi({ baseUrl: "http://x", fetchFn, pageProtocol: "http:" });
    await expect(api.health()).rejects.toMatchObject({ code: "not_dynabox" });
  });

  it("uma página HTML no lugar do JSON vira not_dynabox", async () => {
    const fetchFn = async () => new Response("<html></html>", { status: 200 });
    await expect(createApi({ baseUrl: "http://x", fetchFn, pageProtocol: "http:" }).health()).rejects.toMatchObject({ code: "not_dynabox" });
  });

  it("servidor fora do ar vira network", async () => {
    const { api, server } = make();
    server.state.down = true;
    await expect(api.health()).rejects.toMatchObject({ code: "network" });
  });

  it("não chama o servidor quando o navegador ia bloquear (https chamando http remoto)", async () => {
    const fetchFn = vi.fn();
    const api = createApi({ baseUrl: "http://meuservidor.com", fetchFn, pageProtocol: "https:" });
    await expect(api.health()).rejects.toMatchObject({ code: "mixed_content" });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("cadastro, login e erros dão o código certo", async () => {
    const { api } = make();
    const created = await api.register("ana@example.com", "uma-senha-longa");
    expect(created.user.email).toBe("ana@example.com");
    await expect(api.register("ana@example.com", "uma-senha-longa")).rejects.toMatchObject({ code: "email_taken", status: 409 });
    await expect(api.login("ana@example.com", "errada-errada")).rejects.toMatchObject({ code: "invalid_credentials", status: 401 });
    expect((await api.login("ana@example.com", "uma-senha-longa")).token).toBe(created.token);
  });

  it("registro desligado vira registration_disabled", async () => {
    const { api } = make(createFakeServer({ registration: false }));
    await expect(api.register("a@example.com", "uma-senha-longa")).rejects.toMatchObject({ code: "registration_disabled" });
  });

  it("manda o token, e só manda Content-Type quando há corpo", async () => {
    const { api, server } = make(undefined, { getToken: () => "token-user-1" });
    server.addUser("a@example.com", "uma-senha-longa");
    await api.pull();
    await api.push("k", { a: 1 }, 1, 0);
    await api.deleteAll();

    const [pull, push, del] = server.state.requests.filter((r) => r.path.startsWith("/sync"));
    expect(pull?.headers.authorization).toBe("Bearer token-user-1");
    expect(pull?.headers["content-type"]).toBeUndefined();
    expect(push?.headers["content-type"]).toBe("application/json");
    expect(del?.headers["content-type"]).toBeUndefined(); // o servidor devolveria 400 se viesse
  });

  it("um 409 traz o que o servidor tem", async () => {
    const { api, server } = make(undefined, { getToken: () => "token-user-1" });
    server.addUser("a@example.com", "uma-senha-longa");
    await api.push("k", { v: 1 }, 1, 0);
    const error = await api.push("k", { v: 2 }, 1, 0).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("revision_conflict");
    expect(error.current).toMatchObject({ payload: { v: 1 }, revision: 1 });
  });

  it("um 401 com token avisa que a sessão acabou", async () => {
    const onUnauthorized = vi.fn();
    const { api } = make(undefined, { getToken: () => "token-fantasma", onUnauthorized });
    await expect(api.pull()).rejects.toMatchObject({ code: "unauthorized" });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("um 401 no login NÃO conta como sessão expirada", async () => {
    const onUnauthorized = vi.fn();
    const { api } = make(undefined, { getToken: () => null, onUnauthorized });
    await expect(api.login("x@example.com", "uma-senha-longa")).rejects.toMatchObject({ code: "invalid_credentials" });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("o nome da chave vai codificado na URL", async () => {
    const { api, server } = make(undefined, { getToken: () => "token-user-1" });
    server.addUser("a@example.com", "uma-senha-longa");
    await api.push("w-water-cups", 3, 1, 0);
    expect(server.state.requests.at(-1)?.path).toBe("/sync/w-water-cups");
  });
});

describe("describeError", () => {
  const codes: ApiErrorCode[] = ["network", "mixed_content", "not_dynabox", "invalid_credentials", "email_taken", "registration_disabled", "invalid_request", "unauthorized", "rate_limited", "payload_too_large", "server_error"];

  it.each(codes)("%s tem uma frase em português, sem vazar o código", (code) => {
    const text = describeError(new ApiError(code));
    expect(text.length).toBeGreaterThan(15);
    expect(text).not.toContain(code);
  });

  it("erro desconhecido ainda dá uma frase", () => {
    expect(describeError(new Error("boom"))).toMatch(/Algo deu errado/);
  });

  it("explica o bloqueio de HTTPS dizendo o que fazer", () => {
    expect(describeError(new ApiError("mixed_content"))).toMatch(/https/i);
    expect(describeError(new ApiError("mixed_content"))).toMatch(/localhost/);
  });
});

describe("discoverServer", () => {
  const find = (server: ReturnType<typeof createFakeServer>, address: string) =>
    discoverServer(address, { fetchFn: server.fetchFn, pageProtocol: "http:" });

  it("o endereço certo é usado como está", async () => {
    const server = createFakeServer();
    expect(await find(server, "http://server.test/api")).toEqual({ baseUrl: "http://server.test/api", registration: true });
    expect(server.state.requests).toHaveLength(1); // nem tentou outro
  });

  it("o endereço do app (Docker) leva à API em /api, quando a raiz devolve a página do app", async () => {
    const server = createFakeServer({ onlyUnder: "/api" });
    expect(await find(server, "http://server.test")).toEqual({ baseUrl: "http://server.test/api", registration: true });
  });

  it("a raiz bloqueada por CORS (o navegador acusa 'falha de rede') também leva ao /api", async () => {
    const server = createFakeServer({ onlyUnder: "/api", rootBlocked: true });
    expect((await find(server, "http://server.test")).baseUrl).toBe("http://server.test/api");
  });

  it("repassa se o servidor aceita contas", async () => {
    const server = createFakeServer({ onlyUnder: "/api", registration: false });
    expect((await find(server, "http://server.test")).registration).toBe(false);
  });

  it("não duplica /api, e diz o erro do primeiro endereço se nenhum serve", async () => {
    const server = createFakeServer({ onlyUnder: "/api" });
    server.state.down = true;
    await expect(find(server, "http://server.test/api")).rejects.toMatchObject({ code: "network" });
    expect(server.state.requests).toHaveLength(0);

    await expect(find(createFakeServer({ onlyUnder: "/outro" }), "http://server.test")).rejects.toMatchObject({ code: "not_dynabox" });
  });

  it("um erro que não é 'não achei' não é repetido em /api", async () => {
    const calls: string[] = [];
    const fetchFn = async (url: string) => { calls.push(url); return new Response(JSON.stringify({ error: "x" }), { status: 500 }); };
    await expect(discoverServer("http://x.test", { fetchFn, pageProtocol: "http:" })).rejects.toMatchObject({ code: "server_error" });
    expect(calls).toEqual(["http://x.test/health"]);
  });

  it("https chamando http remoto continua sendo bloqueado, sem tentar nada", async () => {
    const fetchFn = vi.fn();
    await expect(discoverServer("http://meuservidor.com", { fetchFn, pageProtocol: "https:" })).rejects.toMatchObject({ code: "mixed_content" });
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
