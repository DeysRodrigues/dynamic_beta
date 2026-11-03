import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Layout } from "react-grid-layout";
import { readySetups } from "./setups";
import { widgetRegistry } from "@/widgets/registry";
import { boxFromLegacyId } from "@/utils/BoxFactory";
import { packLayouts, GRID_COLS } from "@/utils/layout";
import { readContent, useBoxContentStore } from "@/store/useBoxContentStore";
import { useDashboardStore, selectActiveWorkspace } from "@/store/useDashboardStore";
import DashboardPage from "@/features/dashboard/DashboardPage";

const overlaps = (a: Layout, b: Layout) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe("setups prontos", () => {
  it("há setups, com nome e descrição, e sem id repetido", () => {
    expect(readySetups.length).toBeGreaterThanOrEqual(4);
    expect(new Set(readySetups.map((s) => s.id)).size).toBe(readySetups.length);
    for (const s of readySetups) {
      expect(s.name).not.toBe("");
      expect(s.description.length).toBeGreaterThan(20);
    }
  });

  it("existe o setup de dev, e ele é o mais completo", () => {
    const dev = readySetups.find((s) => s.id === "setup-dev")!;
    expect(dev.boxes.length).toBeGreaterThanOrEqual(8);
    const types = dev.boxes.map((id) => boxFromLegacyId(id).type);
    for (const t of ["tasks", "snippet", "quicklinks", "notepad", "pomodoro"]) expect(types).toContain(t);
  });

  describe.each(readySetups.map((s) => [s.name, s] as const))("%s", (_name, setup) => {
    it("só usa widgets que existem (nenhuma caixa vazia ao instalar)", () => {
      for (const id of setup.boxes) {
        const { type } = boxFromLegacyId(id);
        expect(widgetRegistry[type], `${id} -> ${type}`).toBeDefined();
        expect(widgetRegistry[type].inCatalog, `${type} fora do catálogo`).not.toBe(false);
      }
    });

    it("os ids dos boxes não se repetem", () => {
      expect(new Set(setup.boxes).size).toBe(setup.boxes.length);
    });

    it("tem posição para cada box nos três tamanhos de tela", () => {
      for (const bp of ["lg", "md", "sm"] as const) {
        expect(setup.layouts[bp].map((l) => l.i).sort()).toEqual([...setup.boxes].sort());
      }
    });

    it("nenhum widget fica em cima de outro e nenhum passa da borda", () => {
      for (const bp of ["lg", "md", "sm"] as const) {
        const items = setup.layouts[bp];
        for (const item of items) {
          expect(item.x).toBeGreaterThanOrEqual(0);
          expect(item.x + item.w).toBeLessThanOrEqual(GRID_COLS[bp]);
        }
        for (let i = 0; i < items.length; i++)
          for (let j = i + 1; j < items.length; j++) expect(overlaps(items[i], items[j]), `${bp}: ${items[i].i} x ${items[j].i}`).toBe(false);
      }
    });

    it("todo conteúdo é de um box do setup, e os widgets com schema aceitam o que vem", () => {
      for (const [id, content] of Object.entries(setup.content ?? {})) {
        expect(setup.boxes, `conteúdo órfão ${id}`).toContain(id);
        const schema = widgetRegistry[boxFromLegacyId(id).type].schema;
        if (schema) expect(schema.safeParse(content).success, `${id} fora do schema`).toBe(true);
      }
    });

    it("widgets que dependem de conteúdo vêm com conteúdo", () => {
      const needs = ["snippet", "quicklinks", "notepad", "books", "library", "goals", "countdown", "risk", "habit", "embedded"];
      for (const id of setup.boxes) {
        if (needs.includes(boxFromLegacyId(id).type)) expect(setup.content?.[id], `${id} está vazio`).toBeDefined();
      }
    });

    it("o tema é completo", () => {
      for (const key of ["backgroundColor", "boxColor", "sidebarColor", "textColor", "primaryColor"] as const) {
        expect(setup.theme[key]).toMatch(/^#|^hsl/);
      }
    });
  });

  it("o conteúdo do setup de dev: 10+ snippets, 3 grupos de links, notas em markdown", () => {
    const dev = readySetups.find((s) => s.id === "setup-dev")!;
    const snippets = readContent(dev.content!["snippet-dev"], widgetRegistry.snippet.schema!) as { snippets: unknown[] };
    expect(snippets.snippets.length).toBeGreaterThanOrEqual(10);
    const links = dev.content!["quicklinks-dev"] as { categories: unknown[] };
    expect(links.categories).toHaveLength(3);
    expect((dev.content!["notepad-dev"] as { text: string }).text).toContain("- [ ]");
  });

  it("as contagens regressivas das provas estão no futuro", () => {
    const exams = readySetups.find((s) => s.id === "setup-exams")!;
    for (const id of exams.boxes.filter((b) => b.startsWith("countdown"))) {
      const { targetDate } = exams.content![id] as { targetDate: string };
      expect(new Date(targetDate).getTime()).toBeGreaterThan(Date.now());
    }
  });
});

describe("instalar um setup", () => {
  const initial = useDashboardStore.getState();
  beforeEach(() => {
    useDashboardStore.setState(initial, true);
    useBoxContentStore.setState({ contents: {} });
  });

  it.each(readySetups.map((s) => [s.name, s] as const))("%s: o dashboard mostra todos os widgets", (_name, setup) => {
    useDashboardStore.getState().loadDashboardState(setup.boxes, setup.layouts);
    useBoxContentStore.getState().loadAllContents(setup.content ?? {});

    const { container } = render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(selectActiveWorkspace(useDashboardStore.getState())!.boxes).toHaveLength(setup.boxes.length);
    expect(container.querySelectorAll(".react-grid-item")).toHaveLength(setup.boxes.length);
  });

  it("não apaga o conteúdo de widgets que não fazem parte do setup", () => {
    useBoxContentStore.setState({ contents: { "notepad-meu": { text: "importante" } } });
    useBoxContentStore.getState().loadAllContents({ "notepad-dev": { text: "novo" } });
    expect(useBoxContentStore.getState().contents["notepad-meu"]).toEqual({ text: "importante" });
    expect(useBoxContentStore.getState().contents["notepad-dev"]).toEqual({ text: "novo" });
  });
});

describe("packLayouts", () => {
  it("coloca cada um onde fica mais alto, da esquerda para a direita", () => {
    const l = packLayouts([{ id: "a", w: 2, h: 6 }, { id: "b", w: 2, h: 6 }, { id: "c", w: 1, h: 4 }]).lg;
    expect(l.map((i) => [i.x, i.y])).toEqual([[0, 0], [2, 0], [0, 6]]);
  });
  it("corta a largura pelo número de colunas da tela", () => {
    const out = packLayouts([{ id: "a", w: 3, h: 2 }]);
    expect(out.lg[0].w).toBe(3);
    expect(out.md[0].w).toBe(2);
    expect(out.sm[0].w).toBe(1);
  });
  it("no celular empilha tudo em uma coluna", () => {
    const sm = packLayouts([{ id: "a", w: 2, h: 3 }, { id: "b", w: 1, h: 3 }]).sm;
    expect(sm.map((i) => [i.x, i.y])).toEqual([[0, 0], [0, 3]]);
  });
  it("preenche o buraco ao lado de um item alto", () => {
    const l = packLayouts([{ id: "a", w: 1, h: 6 }, { id: "b", w: 1, h: 2 }, { id: "c", w: 1, h: 2 }]).lg;
    expect(l[1]).toMatchObject({ x: 1, y: 0 });
    expect(l[2]).toMatchObject({ x: 2, y: 0 });
  });
});
