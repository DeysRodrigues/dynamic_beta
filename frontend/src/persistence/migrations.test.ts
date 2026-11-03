import { describe, it, expect } from "vitest";
import { migrateDashboard, migrateProjects } from "./migrations";
import { PERSISTED, persistConfig } from "./registry";

const layouts = { lg: [{ i: "tasks", x: 0, y: 0, w: 1, h: 6 }], md: [], sm: [] };

describe("migrateDashboard (v1 -> v2)", () => {
  it("converte os ids de cada workspace em boxes com tipo", () => {
    const v1 = {
      workspaces: [
        { id: "default", name: "Principal", layouts, boxes: ["tasks", "notepad-abc123"] },
        { id: "w2", name: "Estudos", layouts, boxes: ["pomodoro-zz9"] },
      ],
      activeWorkspaceId: "w2",
      layouts, // espelho
      boxes: ["pomodoro-zz9"], // espelho
    };
    const v2 = migrateDashboard(v1) as { workspaces: Array<{ boxes: unknown }>; activeWorkspaceId: string };

    expect(v2.workspaces[0].boxes).toEqual([
      { id: "tasks", type: "tasks" },
      { id: "notepad-abc123", type: "notepad" },
    ]);
    expect(v2.workspaces[1].boxes).toEqual([{ id: "pomodoro-zz9", type: "pomodoro" }]);
    expect(v2.activeWorkspaceId).toBe("w2");
  });

  it("descarta os espelhos do topo", () => {
    const v2 = migrateDashboard({ workspaces: [{ id: "default", name: "P", layouts, boxes: [] }], layouts, boxes: [] });
    expect(Object.keys(v2).sort()).toEqual(["activeWorkspaceId", "workspaces"]);
  });

  it("não perde nenhum id nem o layout", () => {
    const ids = ["tasks", "progress-x1", "embedded-lofi-cat", "three_frogs-9"];
    const v2 = migrateDashboard({ workspaces: [{ id: "default", name: "P", layouts, boxes: ids }] }) as {
      workspaces: Array<{ boxes: Array<{ id: string }>; layouts: unknown }>;
    };
    expect(v2.workspaces[0].boxes.map((b) => b.id)).toEqual(ids);
    expect(v2.workspaces[0].layouts).toEqual(layouts);
  });

  it("dado de antes dos workspaces (só os espelhos) vira um workspace", () => {
    const v2 = migrateDashboard({ layouts, boxes: ["tasks", "tags"] }) as {
      workspaces: Array<{ id: string; boxes: unknown }>;
      activeWorkspaceId: string;
    };
    expect(v2.workspaces).toHaveLength(1);
    expect(v2.workspaces[0].id).toBe("default");
    expect(v2.activeWorkspaceId).toBe("default");
    expect(v2.workspaces[0].boxes).toEqual([
      { id: "tasks", type: "tasks" },
      { id: "tags", type: "tags" },
    ]);
  });

  it("corrige o workspace ativo que não existe mais", () => {
    const v2 = migrateDashboard({
      workspaces: [{ id: "a", name: "A", layouts, boxes: [] }],
      activeWorkspaceId: "sumiu",
    }) as { activeWorkspaceId: string };
    expect(v2.activeWorkspaceId).toBe("a");
  });

  it("aceita boxes que já estão no formato novo", () => {
    const box = { id: "tasks-1", type: "tasks" };
    const v2 = migrateDashboard({ workspaces: [{ id: "a", name: "A", layouts, boxes: [box] }] }) as {
      workspaces: Array<{ boxes: unknown }>;
    };
    expect(v2.workspaces[0].boxes).toEqual([box]);
  });

  it("devolve {} quando não há nada aproveitável, para a store manter o padrão", () => {
    expect(migrateDashboard(undefined)).toEqual({});
    expect(migrateDashboard({})).toEqual({});
    expect(migrateDashboard({ workspaces: [] })).toEqual({});
  });
});

describe("migrateProjects (v1 -> v2)", () => {
  it("converte os boxes de cada projeto e preserva o resto", () => {
    const v1 = {
      activeProjectId: "p1",
      projects: [{ id: "p1", name: "TCC", layouts, boxes: ["project_overview-ab", "tasks-cd"], goals: [{ id: "g" }] }],
    };
    const v2 = migrateProjects(v1) as typeof v1 & { projects: Array<{ boxes: unknown }> };
    expect(v2.activeProjectId).toBe("p1");
    expect(v2.projects[0].boxes).toEqual([
      { id: "project_overview-ab", type: "project_overview" },
      { id: "tasks-cd", type: "tasks" },
    ]);
    expect(v2.projects[0]).toMatchObject({ name: "TCC", goals: [{ id: "g" }] });
  });

  it("deixa passar estado sem projects", () => {
    expect(migrateProjects({ activeProjectId: null })).toEqual({ activeProjectId: null });
  });
});

describe("no ciclo real do persist", () => {
  it("o dashboard salvo na v1 é lido e convertido ao abrir a store", async () => {
    const { useDashboardStore, selectActiveWorkspace } = await import("../store/useDashboardStore");
    localStorage.setItem(
      PERSISTED.dashboard.key,
      JSON.stringify({
        version: 1,
        state: {
          workspaces: [{ id: "default", name: "Principal", layouts, boxes: ["tasks", "notepad-abc"] }],
          activeWorkspaceId: "default",
          layouts,
          boxes: ["tasks", "notepad-abc"],
        },
      })
    );

    await useDashboardStore.persist.rehydrate();

    expect(selectActiveWorkspace(useDashboardStore.getState())!.boxes).toEqual([
      { id: "tasks", type: "tasks" },
      { id: "notepad-abc", type: "notepad" },
    ]);
  });

  it("persistConfig repassa a migração e a versão nova", () => {
    const cfg = persistConfig(PERSISTED.dashboard, migrateDashboard);
    expect(cfg.version).toBe(2);
    expect(cfg.migrate({}, 1)).toEqual({});
  });
});
