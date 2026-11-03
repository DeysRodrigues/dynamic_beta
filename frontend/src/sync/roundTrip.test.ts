import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { clearAppData } from "@/persistence/backup";
import { PERSISTED_STORES, rehydrateAll } from "@/persistence/hydration";
import { useDashboardStore, selectActiveWorkspace } from "@/store/useDashboardStore";
import { useTagStore } from "@/store/useTagStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useUserStore } from "@/store/useUserStore";
import { connect, disconnect } from "./connection";
import { createFakeServer, type FakeServer } from "./fakeServer";
import { useSession } from "./session";
import { useSync } from "./status";

let server: FakeServer;
const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms);
const creds = { serverUrl: "http://server.test", email: "ana@example.com", password: "uma-senha-longa" };

/** What a page reload does to memory: every store goes back to its starting state. */
async function reloadPage() {
  // Memory is wiped but storage is not. Resetting a store through setState would also save its
  // defaults, which a real reload never does, so the saved values are put back afterwards.
  const snapshot = Object.entries({ ...localStorage });
  for (const store of PERSISTED_STORES as unknown as Array<{ getInitialState: () => object; setState: (s: object, replace: boolean) => void }>) {
    store.setState(store.getInitialState(), true);
  }
  localStorage.clear();
  for (const [key, value] of snapshot) localStorage.setItem(key, value);
  await rehydrateAll();
}

beforeEach(() => {
  vi.useFakeTimers();
  server = createFakeServer();
  vi.stubGlobal("fetch", server.fetchFn);
});
afterEach(() => {
  disconnect("user");
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("o roteiro completo: conectar, mexer, sair, resetar, entrar de novo", () => {
  async function editEverything() {
    useUserStore.getState().setName("Deys");
    useDashboardStore.getState().addBox("notepad");
    useThemeStore.getState().setPrimaryColor("#ff00aa");
    useTagStore.getState().addTag("faculdade");
    useTaskStore.getState().addTask?.({ id: "t1", description: "Estudar", tag: "", completed: false, date: "2026-01-01", duration: 30 } as never);
  }

  it("o que se muda depois de conectar chega ao servidor (nome, painel, tema, tags)", async () => {
    await connect({ ...creds, mode: "register" });
    await editEverything();
    await tick(2000);

    const docs = server.docs("user-1");
    for (const key of ["user-profile-storage", "dashboard-storage", "theme-storage", "tags-storage"]) {
      expect(docs.has(key), `${key} não chegou ao servidor`).toBe(true);
    }
    expect((docs.get("user-profile-storage")!.payload as { state: { name: string } }).state.name).toBe("Deys");
    expect(JSON.stringify(docs.get("dashboard-storage")!.payload)).toContain("notepad");
    expect(useSync.getState().status).toBe("synced");
  });

  it("sair, resetar tudo e entrar de novo traz tudo de volta", async () => {
    await connect({ ...creds, mode: "register" });
    await editEverything();
    await tick(2000);

    disconnect("user");
    clearAppData(); // o botão "Resetar tudo"
    await reloadPage(); // e o reload da página
    expect(useUserStore.getState().name).not.toBe("Deys");

    await connect({ ...creds, mode: "login" });

    expect(useUserStore.getState().name).toBe("Deys");
    expect(selectActiveWorkspace(useDashboardStore.getState())!.boxes.some((b) => b.type === "notepad")).toBe(true);
    expect(useThemeStore.getState().primaryColor).toBe("#ff00aa");
    expect(useTagStore.getState().tags).toEqual(["faculdade"]);
    expect(useSync.getState().conflicts).toHaveLength(0);
  });

  it("sair e recarregar SEM resetar mantém tudo, e entrar de novo não cria conflito", async () => {
    await connect({ ...creds, mode: "register" });
    await editEverything();
    await tick(2000);

    disconnect("user");
    await reloadPage();
    expect(useUserStore.getState().name).toBe("Deys"); // o localStorage guardou

    await connect({ ...creds, mode: "login" });
    expect(useSync.getState().conflicts).toHaveLength(0);
    expect(useSync.getState().status).toBe("synced");
    expect(useUserStore.getState().name).toBe("Deys");
  });

  it("recarregar a página conectado retoma a sessão e continua enviando", async () => {
    await connect({ ...creds, mode: "register" });
    await editEverything();
    await tick(2000);
    const sessionBefore = useSession.getState().token;

    await reloadPage();
    const { resumeSession } = await import("./connection");
    resumeSession();
    await tick(100);
    expect(useSession.getState().token).toBe(sessionBefore);

    useUserStore.getState().setName("Deys Rodrigues");
    await tick(2000);
    expect((server.docs("user-1").get("user-profile-storage")!.payload as { state: { name: string } }).state.name).toBe("Deys Rodrigues");
  });
});
