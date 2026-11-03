import { describe, it, expect } from "vitest";
import { widgetList, widgetRegistry, catalogWidgets, getDefaultHeight, FALLBACK_HEIGHT } from "./registry";
import { nativeWidgets } from "@/data/widgetItems";

describe("widget registry", () => {
  it("tem 25 widgets, sem id repetido", () => {
    expect(widgetList).toHaveLength(25);
    expect(new Set(widgetList.map((w) => w.id)).size).toBe(25);
  });

  it("o id nunca tem hífen, porque o tipo do box é o que vem antes do primeiro hífen", () => {
    for (const w of widgetList) expect(w.id).not.toContain("-");
  });

  it("todo widget tem título, descrição, ícone, altura positiva e componente lazy", () => {
    for (const w of widgetList) {
      expect(w.title).not.toBe("");
      expect(w.description).not.toBe("");
      expect(w.icon).toBeTruthy();
      expect(w.defaultHeight).toBeGreaterThan(0);
      expect(w.component.$$typeof).toBe(Symbol.for("react.lazy"));
    }
  });

  it("o registro indexa pelo id", () => {
    for (const w of widgetList) expect(widgetRegistry[w.id]).toBe(w);
  });

  it("o project_overview fica fora do catálogo da loja", () => {
    expect(widgetRegistry.project_overview).toBeDefined();
    expect(catalogWidgets.map((w) => w.id)).not.toContain("project_overview");
    expect(catalogWidgets).toHaveLength(24);
  });

  it("o mood não existe (não tem componente)", () => {
    expect(widgetRegistry.mood).toBeUndefined();
  });

  it("a loja é derivada do registro", () => {
    expect(nativeWidgets).toBe(catalogWidgets);
  });
});

describe("getDefaultHeight", () => {
  it("usa a altura declarada", () => {
    expect(getDefaultHeight("notepad")).toBe(4);
    expect(getDefaultHeight("theme")).toBe(2);
    expect(getDefaultHeight("project_overview")).toBe(5);
  });
  it("cai na altura padrão para tipo desconhecido", () => {
    expect(getDefaultHeight("nao-existe")).toBe(FALLBACK_HEIGHT);
  });
});
