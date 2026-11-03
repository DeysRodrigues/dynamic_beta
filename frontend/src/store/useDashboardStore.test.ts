import { describe, it, expect, beforeEach } from "vitest";
import { useDashboardStore, selectActiveWorkspace } from "./useDashboardStore";

const initial = useDashboardStore.getState();
const active = () => selectActiveWorkspace(useDashboardStore.getState())!;

beforeEach(() => {
  useDashboardStore.setState(initial, true);
  useDashboardStore.getState().resetDashboard();
});

describe("addBox", () => {
  it("cria o box no workspace ativo e nos três breakpoints", () => {
    useDashboardStore.getState().addBox("notepad");
    const ws = active();
    const box = ws.boxes[ws.boxes.length - 1];

    expect(box.type).toBe("notepad");
    expect(box.id.startsWith("notepad-")).toBe(true);
    for (const bp of ["lg", "md", "sm"] as const) {
      expect(ws.layouts[bp].some((l) => l.i === box.id)).toBe(true);
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
});

describe("removeBox", () => {
  it("tira o box da lista e dos três layouts", () => {
    useDashboardStore.getState().addBox("goals");
    const id = active().boxes.at(-1)!.id;
    useDashboardStore.getState().removeBox(id);

    const ws = active();
    expect(ws.boxes.map((b) => b.id)).not.toContain(id);
    for (const bp of ["lg", "md", "sm"] as const) {
      expect(ws.layouts[bp].some((l) => l.i === id)).toBe(false);
    }
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
    expect(active().boxes).toEqual([]);
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
  });

  it("setActiveWorkspace troca o workspace ativo", () => {
    useDashboardStore.getState().addWorkspace("Outro");
    useDashboardStore.getState().setActiveWorkspace("default");
    expect(active().id).toBe("default");
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
    expect(active().boxes.map((b) => b.type)).toEqual(["tasks", "progress", "pomodoro", "tags"]);
  });

  it("toggleFocusMode alterna", () => {
    useDashboardStore.getState().toggleFocusMode();
    expect(useDashboardStore.getState().isFocusMode).toBe(true);
    useDashboardStore.getState().toggleFocusMode();
    expect(useDashboardStore.getState().isFocusMode).toBe(false);
  });
});

describe("loadDashboardState", () => {
  it("converte ids soltos (modelos e temas) em boxes com tipo", () => {
    useDashboardStore.getState().loadDashboardState(["tasks-nord", "embedded-lofi-cat", "tags"], {
      lg: [], md: [], sm: [],
    });
    expect(active().boxes).toEqual([
      { id: "tasks-nord", type: "tasks" },
      { id: "embedded-lofi-cat", type: "embedded" },
      { id: "tags", type: "tags" },
    ]);
  });
});

describe("estado persistido", () => {
  it("não guarda mais os espelhos 'boxes' e 'layouts' no topo", () => {
    const keys = Object.keys(useDashboardStore.getState());
    expect(keys).not.toContain("boxes");
    expect(keys).not.toContain("layouts");
  });
});
