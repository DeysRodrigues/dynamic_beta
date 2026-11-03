import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { KeyValueStorage } from "@/persistence/storage";
import { createApi } from "./api";
import { SyncEngine, type SyncKey } from "./engine";
import { createFakeServer } from "./fakeServer";
import { useSync } from "./status";

const KEYS: SyncKey[] = [
  { key: "tasks-storage", version: 1, label: "Tarefas" },
  { key: "theme-storage", version: 1, label: "Tema e cores" },
  { key: "w-water-cups", version: 1, label: "Copos de água" },
];

function memory(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

const saved = (state: unknown) => JSON.stringify({ state, version: 1 });

function setup(initial: Record<string, string> = {}, bookkeeping = memory(), isDefault?: (key: string, value: unknown) => boolean) {
  const server = createFakeServer();
  const userId = server.addUser("ana@example.com", "uma-senha-longa");
  const api = createApi({ baseUrl: "http://server.test", fetchFn: server.fetchFn, pageProtocol: "http:", getToken: () => `token-${userId}` });
  const storage = memory(initial);
  const applied: string[] = [];
  const onUnauthorized = vi.fn();

  const make = (store = storage) =>
    new SyncEngine({
      api,
      storage: store,
      bookkeeping,
      keys: KEYS,
      identity: `http://server.test|${userId}`,
      applyRemote: (key) => void applied.push(key),
      onUnauthorized,
      isDefault,
    });

  return { server, userId, api, storage, bookkeeping, applied, onUnauthorized, engine: make(), make };
}

beforeEach(() => {
  vi.useFakeTimers();
  useSync.setState({ status: "local", conflicts: [], lastSyncAt: null, problem: null });
});
afterEach(() => vi.useRealTimers());

const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms);

describe("o primeiro encontro", () => {
  it("servidor vazio: envia o que há aqui, e fica sincronizado", async () => {
    const t = setup({ "tasks-storage": saved({ tasks: [1, 2] }), "w-water-cups": "3" });
    await t.engine.start();

    const docs = t.server.docs(t.userId);
    expect(docs.get("tasks-storage")).toMatchObject({ payload: { state: { tasks: [1, 2] }, version: 1 }, revision: 1 });
    expect(docs.get("w-water-cups")).toMatchObject({ payload: 3, revision: 1 });
    expect(docs.has("theme-storage")).toBe(false); // nada local, nada enviado
    expect(useSync.getState().status).toBe("synced");
    expect(useSync.getState().lastSyncAt).not.toBeNull();
    t.engine.stop();
  });

  it("aqui vazio, servidor com dados: traz os dados e avisa o app", async () => {
    const t = setup();
    t.server.seed(t.userId, "tasks-storage", { state: { tasks: ["do servidor"] }, version: 1 }, 1, 4);
    await t.engine.start();

    expect(JSON.parse(t.storage.getItem("tasks-storage")!)).toEqual({ state: { tasks: ["do servidor"] }, version: 1 });
    expect(t.applied).toEqual(["tasks-storage"]);
    expect(t.engine.revisionOf("tasks-storage")).toBe(4);
    expect(useSync.getState().status).toBe("synced");
    t.engine.stop();
  });

  it("os dois com o MESMO dado (mesmo em outra ordem de chaves): adota, sem pergunta", async () => {
    const t = setup({ "theme-storage": '{"version":1,"state":{"b":2,"a":1}}' });
    t.server.seed(t.userId, "theme-storage", { state: { a: 1, b: 2 }, version: 1 }, 1, 7);
    await t.engine.start();

    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(t.engine.revisionOf("theme-storage")).toBe(7);
    expect(t.applied).toEqual([]);
    expect(t.server.docs(t.userId).get("theme-storage")?.revision).toBe(7); // não reescreveu
    t.engine.stop();
  });

  it("os dois com dados DIFERENTES: não sobrescreve nada, pergunta", async () => {
    const t = setup({ "tasks-storage": saved({ tasks: ["daqui"] }) });
    t.server.seed(t.userId, "tasks-storage", { state: { tasks: ["de lá"] }, version: 1 });
    await t.engine.start();

    const { status, conflicts } = useSync.getState();
    expect(status).toBe("conflict");
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({ key: "tasks-storage", label: "Tarefas" });
    expect(JSON.parse(t.storage.getItem("tasks-storage")!).state.tasks).toEqual(["daqui"]);
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { tasks: ["de lá"] }, version: 1 });
    t.engine.stop();
  });
});

describe("mudanças daqui", () => {
  it("vai para o servidor depois de uma pausa, nomeando a revisão que viu", async () => {
    const t = setup({ "tasks-storage": saved({ tasks: [] }) });
    await t.engine.start();
    const before = t.server.state.requests.length;

    const next = saved({ tasks: ["nova"] });
    t.storage.setItem("tasks-storage", next);
    t.engine.markDirty("tasks-storage", next);
    await tick(500);
    expect(t.server.state.requests.length).toBe(before); // ainda esperando a pausa
    await tick(400);

    const put = t.server.state.requests.filter((r) => r.method === "PUT").at(-1)!;
    expect(put.body).toMatchObject({ baseRevision: 1, version: 1 });
    expect(t.server.docs(t.userId).get("tasks-storage")).toMatchObject({ revision: 2, payload: { state: { tasks: ["nova"] } } });
    t.engine.stop();
  });

  it("várias mudanças seguidas viram UM envio", async () => {
    const t = setup({ "tasks-storage": saved({ n: 0 }) });
    await t.engine.start();
    const puts = () => t.server.state.requests.filter((r) => r.method === "PUT").length;
    const base = puts();

    for (let n = 1; n <= 5; n++) {
      const value = saved({ n });
      t.storage.setItem("tasks-storage", value);
      t.engine.markDirty("tasks-storage", value);
      await tick(200);
    }
    await tick(1000);

    expect(puts() - base).toBe(1);
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { n: 5 }, version: 1 });
    t.engine.stop();
  });

  it("um valor que não mudou não é enviado", async () => {
    const value = saved({ same: true });
    const t = setup({ "tasks-storage": value });
    await t.engine.start();
    const puts = () => t.server.state.requests.filter((r) => r.method === "PUT").length;
    const base = puts();

    t.engine.markDirty("tasks-storage", value);
    await tick(2000);
    expect(puts()).toBe(base);
    t.engine.stop();
  });

  it("uma chave que não é do app é ignorada", async () => {
    const t = setup();
    await t.engine.start();
    t.storage.setItem("dynabox-session", "{}");
    t.engine.markDirty("dynabox-session", "{}");
    await tick(2000);
    expect(t.server.state.requests.some((r) => r.path.includes("dynabox-session"))).toBe(false);
    t.engine.stop();
  });

  it("um valor que não é JSON válido é deixado de lado, sem travar o resto", async () => {
    const t = setup({ "tasks-storage": "isso não é json", "w-water-cups": "4" });
    await t.engine.start();
    expect(t.server.docs(t.userId).has("tasks-storage")).toBe(false);
    expect(t.server.docs(t.userId).get("w-water-cups")?.payload).toBe(4);
    expect(useSync.getState().status).toBe("synced");
    t.engine.stop();
  });
});

describe("mudanças de outro aparelho", () => {
  it("uma chave sem alteração local é atualizada e o app é avisado", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    t.applied.length = 0;

    t.server.bump(t.userId, "tasks-storage", { state: { v: 2 }, version: 1 });
    await t.engine.syncNow();

    expect(JSON.parse(t.storage.getItem("tasks-storage")!).state).toEqual({ v: 2 });
    expect(t.applied).toEqual(["tasks-storage"]);
    expect(t.engine.revisionOf("tasks-storage")).toBe(2);
  });

  it("o servidor é consultado de tempos em tempos, e quando a aba volta ao foco", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    const gets = () => t.server.state.requests.filter((r) => r.method === "GET" && r.path === "/sync").length;
    const base = gets();

    await tick(61_000);
    expect(gets()).toBeGreaterThan(base);

    const afterPoll = gets();
    window.dispatchEvent(new Event("focus"));
    await tick(10);
    expect(gets()).toBe(afterPoll + 1);
    window.dispatchEvent(new Event("online"));
    await tick(10);
    expect(gets()).toBe(afterPoll + 2);
    t.engine.stop();
  });

  it("chave suja e o servidor adiante: conflito, e nada é perdido", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();

    const mine = saved({ v: "minha edição" });
    t.storage.setItem("tasks-storage", mine);
    t.engine.markDirty("tasks-storage", mine);
    t.server.bump(t.userId, "tasks-storage", { state: { v: "edição do outro aparelho" }, version: 1 });
    await tick(1000);

    expect(useSync.getState().status).toBe("conflict");
    expect(t.storage.getItem("tasks-storage")).toBe(mine);
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { v: "edição do outro aparelho" }, version: 1 });
    t.engine.stop();
  });

  it("outro aparelho gravou no meio do envio: o 409 vira conflito, não sobrescreve", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();

    t.server.state.beforePut = (key) => t.server.bump(t.userId, key, { state: { v: "chegou primeiro" }, version: 1 });
    const mine = saved({ v: "minha" });
    t.storage.setItem("tasks-storage", mine);
    t.engine.markDirty("tasks-storage", mine);
    await tick(1000);

    expect(useSync.getState().status).toBe("conflict");
    expect(useSync.getState().conflicts[0]?.server.payload).toEqual({ state: { v: "chegou primeiro" }, version: 1 });
    t.engine.stop();
  });

  it("o servidor perdeu a chave: ela é enviada de novo como nova", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    t.server.docs(t.userId).clear();

    await t.engine.syncNow();
    expect(t.server.docs(t.userId).get("tasks-storage")).toMatchObject({ revision: 1, payload: { state: { v: 1 } } });
    expect(useSync.getState().status).toBe("synced");
    t.engine.stop();
  });

  it("uma versão de dado mais nova que a do app é deixada quieta, com aviso", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    t.server.seed(t.userId, "theme-storage", { novo: true }, 99, 3);
    await t.engine.start();

    expect(t.storage.getItem("theme-storage")).toBeNull();
    expect(t.applied).toEqual([]);
    expect(useSync.getState().problem).toBe("app_outdated");
    t.engine.stop();
  });
});

describe("resolver um conflito", () => {
  async function conflicted() {
    const t = setup({ "tasks-storage": saved({ lado: "daqui" }) });
    t.server.seed(t.userId, "tasks-storage", { state: { lado: "de lá" }, version: 1 }, 1, 5);
    await t.engine.start();
    t.applied.length = 0;
    return t;
  }

  it("usar o do servidor: o local é trocado, o app é avisado, e o conflito some", async () => {
    const t = await conflicted();
    await t.engine.resolve("tasks-storage", "server");

    expect(JSON.parse(t.storage.getItem("tasks-storage")!).state).toEqual({ lado: "de lá" });
    expect(t.applied).toEqual(["tasks-storage"]);
    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(useSync.getState().status).toBe("synced");
    expect(t.server.docs(t.userId).get("tasks-storage")?.revision).toBe(5); // o servidor não mudou
    t.engine.stop();
  });

  it("enviar o daqui: passa por cima do servidor, com a revisão certa", async () => {
    const t = await conflicted();
    await t.engine.resolve("tasks-storage", "local");

    expect(t.server.docs(t.userId).get("tasks-storage")).toMatchObject({ revision: 6, payload: { state: { lado: "daqui" } } });
    expect(JSON.parse(t.storage.getItem("tasks-storage")!).state).toEqual({ lado: "daqui" });
    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(useSync.getState().status).toBe("synced");
    t.engine.stop();
  });

  it("resolveAll resolve todos de uma vez", async () => {
    const t = setup({ "tasks-storage": saved({ a: "daqui" }), "theme-storage": saved({ b: "daqui" }) });
    t.server.seed(t.userId, "tasks-storage", { state: { a: "de lá" }, version: 1 });
    t.server.seed(t.userId, "theme-storage", { state: { b: "de lá" }, version: 1 });
    await t.engine.start();
    expect(useSync.getState().conflicts).toHaveLength(2);

    await t.engine.resolveAll("server");
    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(JSON.parse(t.storage.getItem("theme-storage")!).state).toEqual({ b: "de lá" });
    t.engine.stop();
  });

  it("resolver uma chave que não está em conflito não faz nada", async () => {
    const t = setup();
    await t.engine.start();
    await expect(t.engine.resolve("tasks-storage", "server")).resolves.toBeUndefined();
    t.engine.stop();
  });
});

describe("sem conexão e erros", () => {
  it("offline: guarda o que falta enviar, mostra offline, e manda quando a rede volta", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();

    t.server.state.down = true;
    const offlineEdit = saved({ v: "escrito sem rede" });
    t.storage.setItem("tasks-storage", offlineEdit);
    t.engine.markDirty("tasks-storage", offlineEdit);
    await tick(1000);
    expect(useSync.getState().status).toBe("offline");
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { v: 1 }, version: 1 });

    t.server.state.down = false;
    await tick(16_000); // a nova tentativa automática
    expect(useSync.getState().status).toBe("synced");
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { v: "escrito sem rede" }, version: 1 });
    t.engine.stop();
  });

  it("o que estava pendente sobrevive a fechar e abrir o app", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();

    t.server.state.down = true;
    const edit = saved({ v: "pendente" });
    t.storage.setItem("tasks-storage", edit);
    t.engine.markDirty("tasks-storage", edit);
    await tick(1000);
    t.engine.stop(); // fechou a aba

    t.server.state.down = false;
    const reopened = t.make(); // abriu de novo: mesma memória de anotações, outro motor
    await reopened.start();
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { v: "pendente" }, version: 1 });
    reopened.stop();
  });

  it("um token recusado (401) chama onUnauthorized", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    t.server.state.revokedTokens.add(`token-${t.userId}`);
    await t.engine.start();
    expect(t.onUnauthorized).toHaveBeenCalled();
    t.engine.stop();
  });

  it("outra conta ou outro servidor começa do zero, sem herdar anotações", async () => {
    const book = memory();
    const first = setup({ "tasks-storage": saved({ v: 1 }) }, book);
    await first.engine.start();
    expect(first.engine.revisionOf("tasks-storage")).toBe(1);
    first.engine.stop();

    const server2 = createFakeServer();
    const id2 = server2.addUser("outra@example.com", "uma-senha-longa");
    const api2 = createApi({ baseUrl: "http://outro.test", fetchFn: server2.fetchFn, pageProtocol: "http:", getToken: () => `token-${id2}` });
    const engine2 = new SyncEngine({ api: api2, storage: memory(), bookkeeping: book, keys: KEYS, identity: `http://outro.test|${id2}`, applyRemote: () => {} });
    expect(engine2.revisionOf("tasks-storage")).toBeUndefined();
  });

  it("as rodadas nunca se sobrepõem, mesmo com vários pedidos juntos", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    t.server.state.maxInFlight = 0;

    await Promise.all([t.engine.syncNow(), t.engine.syncNow(), t.engine.syncNow()]);
    expect(t.server.state.maxInFlight).toBe(1);
    t.engine.stop();
  });

  it("forget apaga as anotações e volta ao modo local", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    t.engine.forget();
    expect(t.bookkeeping.getItem("dynabox-sync-ledger")).toBeNull();
    expect(useSync.getState().status).toBe("local");

    t.engine.markDirty("tasks-storage", saved({ v: 2 })); // parado: não faz nada
    await tick(2000);
    expect(t.server.docs(t.userId).get("tasks-storage")?.revision).toBe(1);
  });
});

describe("dados que são só o padrão contam como vazios", () => {
  const defaults = (key: string, value: unknown) => JSON.stringify(value) === JSON.stringify({ state: { tags: [] }, version: 1 }) && key === "tasks-storage";

  it("aqui só tem o padrão e o servidor tem dados: traz os do servidor, sem pergunta", async () => {
    const t = setup({ "tasks-storage": saved({ tags: [] }) }, memory(), defaults);
    t.server.seed(t.userId, "tasks-storage", { state: { tags: ["real"] }, version: 1 }, 1, 3);
    await t.engine.start();

    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(JSON.parse(t.storage.getItem("tasks-storage")!).state.tags).toEqual(["real"]);
    expect(t.applied).toEqual(["tasks-storage"]);
    t.engine.stop();
  });

  it("o servidor só tem o padrão e aqui tem dados: manda os daqui por cima, sem pergunta", async () => {
    const t = setup({ "tasks-storage": saved({ tags: ["meus"] }) }, memory(), defaults);
    t.server.seed(t.userId, "tasks-storage", { state: { tags: [] }, version: 1 }, 1, 2);
    await t.engine.start();

    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(t.server.docs(t.userId).get("tasks-storage")).toMatchObject({ revision: 3, payload: { state: { tags: ["meus"] } } });
    t.engine.stop();
  });

  it("os dois com dados de verdade, diferentes: continua perguntando", async () => {
    const t = setup({ "tasks-storage": saved({ tags: ["meus"] }) }, memory(), defaults);
    t.server.seed(t.userId, "tasks-storage", { state: { tags: ["dele"] }, version: 1 });
    await t.engine.start();
    expect(useSync.getState().conflicts).toHaveLength(1);
    t.engine.stop();
  });

  it("depois do primeiro encontro, um padrão local NÃO é tratado como vazio (o dado local manda)", async () => {
    const t = setup({ "tasks-storage": saved({ tags: ["x"] }) }, memory(), defaults);
    await t.engine.start();
    // the person resets the key to its defaults here, which is a real edit to send
    const reset = saved({ tags: [] });
    t.storage.setItem("tasks-storage", reset);
    t.engine.markDirty("tasks-storage", reset);
    await tick(1000);
    expect(t.server.docs(t.userId).get("tasks-storage")?.payload).toEqual({ state: { tags: [] }, version: 1 });
    t.engine.stop();
  });
});

describe("o que a tela mostra sobre o que já foi enviado", () => {
  it("lista as chaves enviadas, com nome amigável e revisão", async () => {
    const t = setup({ "tasks-storage": saved({ tasks: [1] }), "w-water-cups": "3" });
    await t.engine.start();

    const { documents, pending } = useSync.getState();
    expect(documents.map((d) => d.label).sort()).toEqual(["Copos de água", "Tarefas"]);
    expect(documents.every((d) => d.revision === 1 && d.at > 0)).toBe(true);
    expect(pending).toBe(0);
    t.engine.stop();
  });

  it("uma mudança fica 'pendente' até ser enviada, e a revisão sobe depois", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();

    const edit = saved({ v: 2 });
    t.storage.setItem("tasks-storage", edit);
    t.engine.markDirty("tasks-storage", edit);
    expect(useSync.getState().pending).toBe(1);

    await tick(1000);
    expect(useSync.getState().pending).toBe(0);
    expect(useSync.getState().documents.find((d) => d.key === "tasks-storage")?.revision).toBe(2);
    t.engine.stop();
  });

  it("sem conexão a mudança continua pendente", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    t.server.state.down = true;
    const edit = saved({ v: 2 });
    t.storage.setItem("tasks-storage", edit);
    t.engine.markDirty("tasks-storage", edit);
    await tick(1000);
    expect(useSync.getState().pending).toBe(1);
    t.engine.stop();
  });

  it("o que veio do servidor também aparece na lista", async () => {
    const t = setup();
    t.server.seed(t.userId, "theme-storage", { state: { a: 1 }, version: 1 }, 1, 6);
    await t.engine.start();
    expect(useSync.getState().documents).toEqual([expect.objectContaining({ key: "theme-storage", label: "Tema e cores", revision: 6 })]);
    t.engine.stop();
  });

  it("sobrevive a fechar e abrir o app", async () => {
    const book = memory();
    const first = setup({ "tasks-storage": saved({ v: 1 }) }, book);
    await first.engine.start();
    first.engine.stop();
    useSync.setState({ documents: [], pending: 0 });

    const reopened = first.make();
    await reopened.start();
    expect(useSync.getState().documents.map((d) => d.key)).toEqual(["tasks-storage"]);
    reopened.stop();
  });

  it("forget zera a lista", async () => {
    const t = setup({ "tasks-storage": saved({ v: 1 }) });
    await t.engine.start();
    t.engine.forget();
    expect(useSync.getState().documents).toEqual([]);
    expect(useSync.getState().pending).toBe(0);
  });
});
