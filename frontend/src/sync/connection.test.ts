import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createBackup } from "@/persistence/backup";
import { useHydration } from "@/persistence/hydration";
import { PERSISTED, PERSISTED_KEYS } from "@/persistence/registry";
import { useTagStore } from "@/store/useTagStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { ApiError } from "./api";
import { connect, deleteServerData, disconnect, lastDisconnect, resumeSession } from "./connection";
import { createFakeServer, type FakeServer } from "./fakeServer";
import { useSession } from "./session";
import { useSync } from "./status";

let server: FakeServer;
const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms);
const credentials = { serverUrl: "http://server.test", email: "ana@example.com", password: "uma-senha-longa" };

beforeEach(() => {
  vi.useFakeTimers();
  server = createFakeServer();
  vi.stubGlobal("fetch", server.fetchFn);
  useTagStore.setState({ tags: [] });
});

afterEach(() => {
  disconnect("user");
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("conectar", () => {
  it("criar conta: guarda a sessão e fica sincronizado", async () => {
    await connect({ ...credentials, mode: "register" });

    const { serverUrl, token, user } = useSession.getState();
    expect(serverUrl).toBe("http://server.test");
    expect(token).toMatch(/^token-/);
    expect(user?.email).toBe("ana@example.com");
    expect(useSync.getState().status).toBe("synced");
  });

  it("o endereço do app (Docker) funciona: a sessão guarda o /api que foi achado", async () => {
    vi.stubGlobal("fetch", createFakeServer({ onlyUnder: "/api" }).fetchFn);
    await connect({ ...credentials, serverUrl: "http://server.test", mode: "register" });
    expect(useSession.getState().serverUrl).toBe("http://server.test/api");
    expect(useSync.getState().status).toBe("synced");
  });

  it("endereço sem esquema é entendido (localhost vira http)", async () => {
    await connect({ ...credentials, serverUrl: " server.test/ ", mode: "register" });
    expect(useSession.getState().serverUrl).toBe("https://server.test");
  });

  it("depois de conectar, o que uma store salva chega ao servidor", async () => {
    await connect({ ...credentials, mode: "register" });
    useTagStore.getState().addTag("faculdade");
    await tick(1000);

    const userId = useSession.getState().user!.id;
    expect(server.docs(userId).get("tags-storage")?.payload).toMatchObject({ state: { tags: ["faculdade"] } });
  });

  it("entrar com dados no servidor e nada aqui: a store recebe, sem a tela piscar", async () => {
    const id = server.addUser(credentials.email, credentials.password);
    server.seed(id, "tags-storage", { state: { tags: ["de outro aparelho"] }, version: 1 }, 1, 3);

    const seen: boolean[] = [];
    const stop = useHydration.subscribe((s) => seen.push(s.hydrated));
    await connect({ ...credentials, mode: "login" });
    stop();

    expect(useTagStore.getState().tags).toEqual(["de outro aparelho"]);
    expect(seen.includes(false), "a tela esperou (piscou) durante a atualização").toBe(false);
  });

  it("mudança em outro aparelho aparece sem recarregar", async () => {
    await connect({ ...credentials, mode: "register" });
    const userId = useSession.getState().user!.id;

    server.seed(userId, "tags-storage", { state: { tags: ["chegou"] }, version: 1 }, 1, 2);
    await vi.advanceTimersByTimeAsync(61_000);
    expect(useTagStore.getState().tags).toEqual(["chegou"]);
  });

  it("conteúdo de widget vindo de fora faz os widgets recomeçarem", async () => {
    await connect({ ...credentials, mode: "register" });
    const userId = useSession.getState().user!.id;
    const before = useHydration.getState().epoch;

    server.seed(userId, PERSISTED.boxContent.key, { state: { contents: { "notepad-x": { text: "novo" } } }, version: 1 }, 1, 2);
    await vi.advanceTimersByTimeAsync(61_000);

    expect(useBoxContentStore.getState().contents["notepad-x"]).toEqual({ text: "novo" });
    expect(useHydration.getState().epoch).toBeGreaterThan(before);
  });

  it.each([
    ["senha errada", { password: "errada-errada" }, "invalid_credentials"],
    ["conta que não existe", { email: "ninguem@example.com" }, "invalid_credentials"],
  ])("entrar com %s falha e não conecta nada", async (_name, override, code) => {
    server.addUser(credentials.email, credentials.password);
    await expect(connect({ ...credentials, ...override, mode: "login" })).rejects.toMatchObject({ code });
    expect(useSession.getState().token).toBeNull();
    expect(useSync.getState().status).toBe("local");

    useTagStore.getState().addTag("local");
    await tick(2000);
    expect(server.state.requests.some((r) => r.method === "PUT")).toBe(false);
  });

  it("e-mail já usado ao criar conta", async () => {
    server.addUser(credentials.email, credentials.password);
    await expect(connect({ ...credentials, mode: "register" })).rejects.toMatchObject({ code: "email_taken" });
  });

  it("servidor que não aceita contas", async () => {
    server.state.registration = false;
    await expect(connect({ ...credentials, mode: "register" })).rejects.toMatchObject({ code: "registration_disabled" });
  });

  it("servidor fora do ar: erro de rede, nada guardado", async () => {
    server.state.down = true;
    await expect(connect({ ...credentials, mode: "register" })).rejects.toBeInstanceOf(ApiError);
    expect(useSession.getState().token).toBeNull();
  });

  it("endereço vazio é recusado antes de qualquer pedido", async () => {
    await expect(connect({ ...credentials, serverUrl: "  ", mode: "register" })).rejects.toBeInstanceOf(ApiError);
    expect(server.state.requests).toHaveLength(0);
  });
});

describe("sair", () => {
  it("volta ao modo local: a sessão some, o que se faz deixa de ir ao servidor, e os dados ficam", async () => {
    await connect({ ...credentials, mode: "register" });
    useTagStore.getState().addTag("antes");
    await tick(1000);
    const userId = useSession.getState().user!.id;

    disconnect("user");
    expect(useSession.getState().token).toBeNull();
    expect(useSync.getState().status).toBe("local");
    expect(lastDisconnect.reason).toBe("user");

    useTagStore.getState().addTag("depois");
    await tick(3000);
    expect(server.docs(userId).get("tags-storage")?.payload).toMatchObject({ state: { tags: ["antes"] } }); // o servidor não soube do "depois"
    expect(JSON.parse(localStorage.getItem("tags-storage")!).state.tags).toEqual(["antes", "depois"]); // mas aqui ficou salvo
  });

  it("depois de sair, o app continua salvando localmente (as stores seguem válidas)", async () => {
    await connect({ ...credentials, mode: "register" });
    disconnect("user");
    useTagStore.getState().addTag("segue salvando");
    expect(JSON.parse(localStorage.getItem("tags-storage")!).state.tags).toContain("segue salvando");
  });

  it("token recusado pelo servidor: sai sozinho, dizendo que expirou", async () => {
    await connect({ ...credentials, mode: "register" });
    server.state.revokedTokens.add(useSession.getState().token!);

    await vi.advanceTimersByTimeAsync(61_000);
    expect(useSession.getState().token).toBeNull();
    expect(lastDisconnect.reason).toBe("expired");
    expect(useSync.getState().status).toBe("local");
  });

  it("apagar os dados da conta limpa o servidor e volta ao modo local, mantendo os dados daqui", async () => {
    await connect({ ...credentials, mode: "register" });
    useTagStore.getState().addTag("fica aqui");
    await tick(1000);
    const userId = useSession.getState().user!.id;
    expect(server.docs(userId).size).toBeGreaterThan(0);

    await deleteServerData();
    expect(server.docs(userId).size).toBe(0);
    expect(useSession.getState().token).toBeNull();
    expect(lastDisconnect.reason).toBe("deleted");
    expect(JSON.parse(localStorage.getItem("tags-storage")!).state.tags).toEqual(["fica aqui"]);
  });
});

describe("abrir o app de novo", () => {
  it("retoma a sessão salva e sincroniza", async () => {
    const id = server.addUser(credentials.email, credentials.password);
    server.seed(id, "tags-storage", { state: { tags: ["do servidor"] }, version: 1 });
    useSession.getState().setSession("http://server.test", `token-${id}`, { id, email: credentials.email });

    resumeSession();
    await tick(10);
    expect(useSync.getState().status).toBe("synced");
    expect(useTagStore.getState().tags).toEqual(["do servidor"]);
  });

  it("sem sessão salva, não faz nenhum pedido: o app é só local", async () => {
    resumeSession();
    await tick(5000);
    expect(server.state.requests).toHaveLength(0);
    expect(useSync.getState().status).toBe("local");
  });
});

describe("o que fica de fora do backup e da sincronização", () => {
  it("a sessão e as anotações da sincronização não são dados do app", async () => {
    await connect({ ...credentials, mode: "register" });
    expect(PERSISTED_KEYS).not.toContain("dynabox-session");
    expect(PERSISTED_KEYS).not.toContain("dynabox-sync-ledger");
    expect(localStorage.getItem("dynabox-session")).not.toBeNull();

    const backup = createBackup();
    expect(Object.keys(backup.data)).not.toContain("dynabox-session");
    expect(JSON.stringify(backup)).not.toMatch(/token-/);
  });

  it("o servidor nunca recebe a sessão nem as anotações", async () => {
    await connect({ ...credentials, mode: "register" });
    useTagStore.getState().addTag("x");
    await tick(2000);
    const keys = server.state.requests.filter((r) => r.method === "PUT").map((r) => r.path);
    expect(keys.every((k) => PERSISTED_KEYS.some((p) => k === `/sync/${p}`))).toBe(true);
  });
});
