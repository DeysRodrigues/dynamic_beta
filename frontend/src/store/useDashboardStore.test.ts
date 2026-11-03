import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore } from "./useDashboardStore";

const initial = useDashboardStore.getState();
const active = () => {
  const s = useDashboardStore.getState();
  return s.workspaces.find((w) => w.id === s.activeWorkspaceId)!;
};

beforeEach(() => {
  useDashboardStore.setState(initial, true);
  useDashboardStore.getState().resetDashboard();
});

describe("addBox", () => {
  it("cria o box no workspace ativo e nos três breakpoints", () => {
    useDashboardStore.getState().addBox("notepad");
    const ws = active();
    const id = ws.boxes[ws.boxes.length - 1];

    expect(id.startsWith("notepad-")).toBe(true);
    for (const bp of ["lg", "md", "sm"] as const) {
      expect(ws.layouts[bp].some((l) => l.i === id)).toBe(true);
    }
  });

  it("usa a altura do tipo (notepad = 4) e a padrão (3) para tipo desconhecido", () => {
    useDashboardStore.getState().addBox("notepad");
    useDashboardStore.getState().addBox("coisa-que-nao-existe");
    const lg = active().layouts.lg;
    expect(lg[lg.length - 2].h).toBe(4);
    expect(lg[lg.length - 1].h).toBe(3);
  });

  it("coloca o box na coluna mais curta", () => {
    // layout padrão lg: col 0 = 6, col 1 = 6, col 2 = 2, col 3 = 0
    useDashboardStore.getState().addBox("notes");
    const lg = active().layouts.lg;
    expect(lg[lg.length - 1].x).toBe(3);
  });

  it("mantém os espelhos 'boxes' e 'layouts' em sincronia", () => {
    useDashboardStore.getState().addBox("goals");
    const s = useDashboardStore.getState();
    expect(s.boxes).toEqual(active().boxes);
    expect(s.layouts).toEqual(active().layouts);
  });
});

describe("removeBox", () => {
  it("tira o box da lista e dos três layouts", () => {
    useDashboardStore.getState().addBox("goals");
    const id = active().boxes.at(-1)!;
    useDashboardStore.getState().removeBox(id);

    const ws = active();
    expect(ws.boxes).not.toContain(id);
    for (const bp of ["lg", "md", "sm"] as const) {
      expect(ws.layouts[bp].some((l) => l.i === id)).toBe(false);
    }
    expect(useDashboardStore.getState().boxes).not.toContain(id);
  });

  it("ignora id inexistente", () => {
    const before = active().boxes.length;
    useDashboardStore.getState().removeBox("nao-existe");
    expect(active().boxes).toHaveLength(before);
  });
});

describe("workspaces", () => {
  it("addWorkspace cria vazio e ativa", () => {
    useDashboardStore.getState().addWorkspace("Estudos");
    const s = useDashboardStore.getState();
    expect(s.workspaces).toHaveLength(2);
    expect(active().name).toBe("Estudos");
    expect(s.boxes).toEqual([]);
  });

  it("removeWorkspace nunca deixa zero workspaces", () => {
    useDashboardStore.getState().removeWorkspace("default");
    expect(useDashboardStore.getState().workspaces).toHaveLength(1);
  });

  it("removeWorkspace do ativo passa o foco para o primeiro que sobrar", () => {
    useDashboardStore.getState().addWorkspace("Outro");
    const outroId = useDashboardStore.getState().activeWorkspaceId;
    useDashboardStore.getState().removeWorkspace(outroId);
    const s = useDashboardStore.getState();
    expect(s.activeWorkspaceId).toBe("default");
    expect(s.boxes).toEqual(active().boxes);
  });

  it("setActiveWorkspace troca e atualiza os espelhos", () => {
    useDashboardStore.getState().addWorkspace("Outro");
    useDashboardStore.getState().setActiveWorkspace("default");
    expect(useDashboardStore.getState().boxes).toEqual(active().boxes);
  });

  it("renameWorkspace renomeia", () => {
    useDashboardStore.getState().renameWorkspace("default", "Casa");
    expect(active().name).toBe("Casa");
  });
});

describe("resetDashboard e focus mode", () => {
  it("volta ao layout padrão de 4 widgets", () => {
    useDashboardStore.getState().addBox("goals");
    useDashboardStore.getState().resetDashboard();
    expect(active().boxes).toEqual(["tasks", "progress", "pomodoro", "tags"]);
  });

  it("toggleFocusMode alterna", () => {
    useDashboardStore.getState().toggleFocusMode();
    expect(useDashboardStore.getState().isFocusMode).toBe(true);
    useDashboardStore.getState().toggleFocusMode();
    expect(useDashboardStore.getState().isFocusMode).toBe(false);
  });
});
