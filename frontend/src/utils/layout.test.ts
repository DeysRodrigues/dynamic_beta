import { describe, it, expect } from "vitest";
import type { Layouts } from "react-grid-layout";
import { addBoxToLayouts } from "./layout";

const empty = (): Layouts => ({ lg: [], md: [], sm: [] });

describe("addBoxToLayouts", () => {
  it("adiciona o box nos três breakpoints", () => {
    const l = empty();
    addBoxToLayouts(l, "a", 3);
    for (const bp of ["lg", "md", "sm"]) expect(l[bp]).toHaveLength(1);
  });

  it("cria o breakpoint que não existe", () => {
    const l = {} as Layouts;
    addBoxToLayouts(l, "a", 3);
    expect(l.lg).toHaveLength(1);
  });

  it("usa y infinito e largura 1, com a altura pedida", () => {
    const l = empty();
    addBoxToLayouts(l, "a", 4);
    expect(l.lg[0]).toEqual({ i: "a", x: 0, y: Infinity, w: 1, h: 4 });
  });

  it("escolhe a coluna mais curta", () => {
    const l = empty();
    l.lg = [
      { i: "x", x: 0, y: 0, w: 1, h: 6 },
      { i: "y", x: 1, y: 0, w: 1, h: 2 },
      { i: "z", x: 2, y: 0, w: 1, h: 4 },
    ];
    addBoxToLayouts(l, "novo", 3);
    expect(l.lg.at(-1)!.x).toBe(3); // coluna 3 está vazia
  });

  it("desempata pela coluna mais à esquerda", () => {
    const l = empty();
    l.lg = [{ i: "x", x: 0, y: 0, w: 1, h: 2 }];
    addBoxToLayouts(l, "novo", 3);
    expect(l.lg.at(-1)!.x).toBe(1);
  });

  it("conta a altura de item que ocupa várias colunas", () => {
    const l = empty();
    l.lg = [{ i: "largo", x: 0, y: 0, w: 2, h: 5 }];
    addBoxToLayouts(l, "novo", 3);
    expect(l.lg.at(-1)!.x).toBe(2);
  });

  it("em sm só existe uma coluna", () => {
    const l = empty();
    addBoxToLayouts(l, "a", 3);
    addBoxToLayouts(l, "b", 3);
    expect(l.sm.every((i) => i.x === 0)).toBe(true);
  });
});
