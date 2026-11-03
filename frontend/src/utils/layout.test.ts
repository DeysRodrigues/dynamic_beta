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

import { ensureLayouts } from "./layout";
import type { BoxRef } from "@/types/Box";

describe("ensureLayouts", () => {
  const box = (type: string, n = 1): BoxRef => ({ id: `${type}-${n}`, type });
  const heightOf = (type: string) => (type === "notepad" ? 4 : 3);

  it("dá posição e altura a cada box em todos os breakpoints, a partir de layouts vazios", () => {
    const out = ensureLayouts([box("tasks"), box("notepad")], { lg: [], md: [], sm: [] }, heightOf);
    for (const bp of ["lg", "md", "sm"]) {
      expect(out[bp]).toHaveLength(2);
      expect(out[bp].find((i) => i.i === "notepad-1")!.h).toBe(4);
      expect(out[bp].find((i) => i.i === "tasks-1")!.h).toBe(3);
    }
  });

  it("aceita layouts indefinidos", () => {
    expect(ensureLayouts([box("tasks")], undefined, heightOf).lg).toHaveLength(1);
  });

  it("espalha os boxes novos pelas colunas, sem empilhar todos no mesmo lugar", () => {
    const out = ensureLayouts([box("a", 1), box("a", 2), box("a", 3), box("a", 4)], {}, heightOf);
    expect(out.lg.map((i) => i.x)).toEqual([0, 1, 2, 3]);
    expect(out.lg.every((i) => Number.isFinite(i.y))).toBe(true);
    expect(new Set(out.sm.map((i) => i.y)).size).toBe(4); // uma coluna só: um embaixo do outro
  });

  it("não mexe no que o usuário já arrumou", () => {
    const arranged = { lg: [{ i: "tasks-1", x: 2, y: 5, w: 2, h: 7 }], md: [], sm: [] };
    const out = ensureLayouts([box("tasks")], arranged, heightOf);
    expect(out.lg[0]).toEqual({ i: "tasks-1", x: 2, y: 5, w: 2, h: 7 });
  });

  it("completa só o que falta e posiciona o novo abaixo do existente", () => {
    const arranged = { lg: [{ i: "tasks-1", x: 0, y: 0, w: 1, h: 6 }], md: [], sm: [] };
    const out = ensureLayouts([box("tasks"), box("notepad")], arranged, heightOf);
    expect(out.lg).toHaveLength(2);
    expect(out.lg.find((i) => i.i === "notepad-1")!.x).toBe(1); // coluna 0 está ocupada
  });

  it("descarta o layout de box que não existe mais", () => {
    const stale = { lg: [{ i: "sumiu-1", x: 0, y: 0, w: 1, h: 3 }, { i: "tasks-1", x: 1, y: 0, w: 1, h: 3 }], md: [], sm: [] };
    const out = ensureLayouts([box("tasks")], stale, heightOf);
    expect(out.lg.map((i) => i.i)).toEqual(["tasks-1"]);
  });

  it("não altera o objeto recebido", () => {
    const input = { lg: [], md: [], sm: [] };
    ensureLayouts([box("tasks")], input, heightOf);
    expect(input.lg).toHaveLength(0);
  });

  it("é estável: aplicar de novo devolve o mesmo conteúdo", () => {
    const once = ensureLayouts([box("tasks"), box("notepad")], {}, heightOf);
    expect(ensureLayouts([box("tasks"), box("notepad")], once, heightOf)).toEqual(once);
  });
});
