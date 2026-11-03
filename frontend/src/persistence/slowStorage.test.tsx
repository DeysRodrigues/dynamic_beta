import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { appStorage, getRevision, hasRead, localStorageAdapter, setStorageAdapter, type StorageAdapter } from "./adapter";
import { rehydrateAll, useHydration, whenHydrated, PERSISTED_STORES } from "./hydration";
import { PERSISTED, PERSISTED_KEYS } from "./registry";
import { HydrationGate } from "@/components/layout/HydrationGate";
import DashboardPage from "@/features/dashboard/DashboardPage";
import NotepadBox from "@/components/layout/boxes/NotepadBox";
import { useThemeStore } from "@/store/useThemeStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";

/** An in-memory store that answers after `delay` ms, and records every call. */
function slowAdapter(initial: Record<string, string>, delay = 500) {
  const data = new Map(Object.entries(initial));
  const revisionMap = new Map<string, number>();
  const log: { op: "get" | "set"; key: string; value?: string }[] = [];
  const later = <T,>(fn: () => T) => new Promise<T>((resolve) => setTimeout(() => resolve(fn()), delay));

  const adapter: StorageAdapter & { log: typeof log; data: typeof data } = {
    log,
    data,
    getItem: (key) => later(() => { log.push({ op: "get", key }); return data.get(key) ?? null; }),
    setItem: (key, value) => later(() => { log.push({ op: "set", key, value }); data.set(key, value); revisionMap.set(key, (revisionMap.get(key) ?? 0) + 1); }),
    removeItem: (key) => later(() => { data.delete(key); }),
    revisionOf: (key) => revisionMap.get(key),
  };
  return adapter;
}

const dashboardWith = (box: { id: string; type: string }) =>
  JSON.stringify({
    version: 2,
    state: {
      activeWorkspaceId: "default",
      workspaces: [{ id: "default", name: "Principal", boxes: [box], layouts: { lg: [{ i: box.id, x: 0, y: 0, w: 1, h: 4 }], md: [], sm: [] } }],
    },
  });

const SAVED_NOTE = {
  [PERSISTED.dashboard.key]: dashboardWith({ id: "notepad-x", type: "notepad" }),
  [PERSISTED.boxContent.key]: JSON.stringify({ version: 1, state: { contents: { "notepad-x": { text: "conteúdo salvo", view: "edit" } } } }),
};

async function restoreLocalStorage() {
  setStorageAdapter(localStorageAdapter);
  localStorage.clear();
  await act(async () => { await rehydrateAll(); });
}

afterEach(async () => {
  vi.useRealTimers();
  await restoreLocalStorage();
});

describe("o armazenamento compartilhado", () => {
  it("com o localStorage tudo continua síncrono: lê e grava na hora", () => {
    localStorage.setItem("k-sync", "valor");
    expect(appStorage.getItem("k-sync")).toBe("valor");
    expect(hasRead("k-sync")).toBe(true);
    appStorage.setItem("k-sync", "novo");
    expect(localStorage.getItem("k-sync")).toBe("novo");
  });

  it("descarta a escrita de uma chave que ainda não foi lida, e deixa passar depois da leitura", async () => {
    const adapter = slowAdapter({ "k-a": "guardado" }, 100);
    setStorageAdapter(adapter);
    vi.useFakeTimers();

    appStorage.setItem("k-a", "padrão vazio");
    await vi.advanceTimersByTimeAsync(300);
    expect(adapter.log.filter((l) => l.op === "set")).toHaveLength(0);
    expect(adapter.data.get("k-a")).toBe("guardado");

    const read = appStorage.getItem("k-a") as Promise<string | null>;
    await vi.advanceTimersByTimeAsync(150);
    expect(await read).toBe("guardado");

    appStorage.setItem("k-a", "editado");
    await vi.advanceTimersByTimeAsync(150);
    expect(adapter.data.get("k-a")).toBe("editado");
  });

  it("guarda a revisão que o backend informou, para a checagem de conflito", async () => {
    const adapter = slowAdapter({ "k-r": "1" }, 50);
    setStorageAdapter(adapter);
    vi.useFakeTimers();

    expect(getRevision("k-r")).toBeUndefined();
    void appStorage.getItem("k-r");
    await vi.advanceTimersByTimeAsync(100);
    expect(getRevision("k-r")).toBeUndefined(); // o backend ainda não tem revisão dessa chave

    void appStorage.setItem("k-r", "2");
    await vi.advanceTimersByTimeAsync(100);
    expect(getRevision("k-r")).toBe(1);
    void appStorage.setItem("k-r", "3");
    await vi.advanceTimersByTimeAsync(100);
    expect(getRevision("k-r")).toBe(2);
  });

  it("uma leitura que falha deixa a chave como não lida, e avisa", async () => {
    const failing: StorageAdapter = { getItem: () => Promise.reject(new Error("sem rede")), setItem: () => {}, removeItem: () => {} };
    setStorageAdapter(failing);
    await expect(appStorage.getItem("k-f") as Promise<unknown>).rejects.toThrow("sem rede");
    expect(hasRead("k-f")).toBe(false);
    appStorage.setItem("k-f", "x");
    expect(localStorage.getItem("k-f")).toBeNull();
  });
});

describe("com um armazenamento lento (500 ms)", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

  it("a tela espera, e depois mostra os widgets salvos, nunca os padrões", async () => {
    const adapter = slowAdapter(SAVED_NOTE);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });
    expect(useHydration.getState().hydrated).toBe(false);

    const { container } = render(<MemoryRouter><HydrationGate><DashboardPage /></HydrationGate></MemoryRouter>);

    // enquanto lê: nada de grid, nem o painel padrão de 4 widgets
    expect(container.querySelectorAll(".react-grid-item")).toHaveLength(0);
    expect(adapter.log.filter((l) => l.op === "set")).toHaveLength(0);

    const seen: number[] = [];
    const observer = new MutationObserver(() => seen.push(container.querySelectorAll(".react-grid-item").length));
    observer.observe(container, { childList: true, subtree: true });

    await act(async () => { await vi.advanceTimersByTimeAsync(700); });

    expect(useHydration.getState().hydrated).toBe(true);
    expect(await screen.findByDisplayValue("conteúdo salvo", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(container.querySelectorAll(".react-grid-item")).toHaveLength(1);
    observer.disconnect();
    expect(Math.max(0, ...seen), "o grid nunca mostrou mais que o widget salvo").toBeLessThanOrEqual(1);
  });

  it("nenhum widget grava vazio por cima do conteúdo", async () => {
    const adapter = slowAdapter(SAVED_NOTE);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });
    render(<MemoryRouter><HydrationGate><DashboardPage /></HydrationGate></MemoryRouter>);

    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    await screen.findByDisplayValue("conteúdo salvo", {}, { timeout: 5000 });
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); }); // o bloco de notas salva 1 s depois de abrir

    for (const write of adapter.log.filter((l) => l.op === "set")) {
      const get = adapter.log.findIndex((l) => l.op === "get" && l.key === write.key);
      expect(get, `${write.key} foi gravada sem ter sido lida`).toBeGreaterThanOrEqual(0);
      expect(adapter.log.indexOf(write)).toBeGreaterThan(get);
    }
    const content = JSON.parse(adapter.data.get(PERSISTED.boxContent.key)!).state.contents["notepad-x"];
    expect(content.text).toBe("conteúdo salvo");
    expect(useBoxContentStore.getState().contents["notepad-x"]).toMatchObject({ text: "conteúdo salvo" });
  });

  it("uma mudança feita antes da leitura terminar não é gravada por cima do que está guardado", async () => {
    const adapter = slowAdapter(SAVED_NOTE);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });

    act(() => { useThemeStore.getState().setBoxOpacity(0.33); });
    act(() => { useDashboardStore.getState().addWorkspace("antes da hora"); });
    // long enough for a write that was NOT dropped to reach the adapter (it answers in 500 ms)
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });

    expect(adapter.log.filter((l) => l.op === "set")).toHaveLength(0);
    expect(adapter.data.get(PERSISTED.dashboard.key)).toBe(SAVED_NOTE[PERSISTED.dashboard.key]);
  });

  it("depois de carregar, o que se faz volta a ser salvo", async () => {
    const adapter = slowAdapter(SAVED_NOTE);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });

    act(() => { useThemeStore.getState().setBoxOpacity(0.5); });
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });

    const theme = JSON.parse(adapter.data.get(PERSISTED.theme.key)!);
    expect(theme.state.boxOpacity).toBe(0.5);
  });

  it("mostra 'Carregando' só se demorar, e não pisca numa leitura rápida", async () => {
    const adapter = slowAdapter(SAVED_NOTE, 1000);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });
    render(<MemoryRouter><HydrationGate><div>conteúdo</div></HydrationGate></MemoryRouter>);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    expect(screen.getByRole("status")).toHaveTextContent("Carregando seus dados");
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("whenHydrated resolve só depois que todas as stores leram", async () => {
    const adapter = slowAdapter(SAVED_NOTE);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });
    let done = false;
    void whenHydrated().then(() => { done = true; });

    await vi.advanceTimersByTimeAsync(200);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(600);
    expect(done).toBe(true);
  });
});

describe("ler de novo com widgets já na tela (um login, por exemplo)", () => {
  it("o widget passa a mostrar o conteúdo que veio, em vez de ficar com o antigo", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const adapter = slowAdapter(SAVED_NOTE, 100);
    setStorageAdapter(adapter);
    act(() => { void rehydrateAll(); });
    render(<MemoryRouter><HydrationGate><NotepadBox id="notepad-x" /></HydrationGate></MemoryRouter>);

    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(await screen.findByDisplayValue("conteúdo salvo")).toBeInTheDocument();

    // the other side now has a newer version of the note
    adapter.data.set(
      PERSISTED.boxContent.key,
      JSON.stringify({ version: 1, state: { contents: { "notepad-x": { text: "versão do servidor", view: "edit" } } } })
    );
    act(() => { void rehydrateAll(); });
    expect(screen.queryByDisplayValue("conteúdo salvo")).not.toBeInTheDocument(); // the screen waits again

    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(await screen.findByDisplayValue("versão do servidor")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("conteúdo salvo")).not.toBeInTheDocument();
  });
});

describe("quando a leitura falha", () => {
  it("mostra o erro e o botão de tentar de novo, sem apagar nada, e a segunda tentativa funciona", async () => {
    let broken = true;
    const data = new Map(Object.entries(SAVED_NOTE));
    const writes: string[] = [];
    const flaky: StorageAdapter = {
      getItem: async (key) => { if (broken) throw new Error("sem rede"); return data.get(key) ?? null; },
      setItem: async (key, value) => { writes.push(key); data.set(key, value); },
      removeItem: async () => {},
    };
    setStorageAdapter(flaky);
    await act(async () => { await rehydrateAll(); });

    render(<MemoryRouter><HydrationGate><div>tudo certo</div></HydrationGate></MemoryRouter>);
    expect(screen.getByRole("alert")).toHaveTextContent("Não consegui carregar seus dados");
    expect(screen.queryByText("tudo certo")).not.toBeInTheDocument();

    act(() => { useThemeStore.getState().setBoxOpacity(0.1); }); // nada deve ser gravado por cima
    expect(writes).toHaveLength(0);
    expect(data.get(PERSISTED.boxContent.key)).toBe(SAVED_NOTE[PERSISTED.boxContent.key]);

    broken = false;
    await act(async () => { await userEvent.click(screen.getByText("Tentar de novo")); });
    expect(await screen.findByText("tudo certo")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("a lista de stores", () => {
  it("cobre todas as 14 stores persistidas", () => {
    expect(PERSISTED_STORES).toHaveLength(14);
    const names = PERSISTED_STORES.map((s) => (s as unknown as { persist: { getOptions: () => { name: string } } }).persist.getOptions().name);
    for (const key of PERSISTED_KEYS.filter((k) => k !== PERSISTED.waterCups.key)) expect(names).toContain(key);
  });
});
