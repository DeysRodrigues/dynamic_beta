import { describe, it, expect, beforeEach } from "vitest";
import { usePlanBoardStore } from "./usePlanBoardStore";

const get = () => usePlanBoardStore.getState();
const free = (blockId: string, start: string, end: string) => ({ blockId, start, end, kind: "free" as const });

beforeEach(() => {
  usePlanBoardStore.setState({ cards: [], blocks: [], slots: [], templates: [] });
});

describe("cards", () => {
  it("cria o card com o título aparado e uma cor", () => {
    get().addCard("  lab ds  ");
    expect(get().cards).toHaveLength(1);
    expect(get().cards[0].title).toBe("lab ds");
    expect(get().cards[0].color).toMatch(/^#/);
  });

  it("ignora título vazio", () => {
    get().addCard("   ");
    expect(get().cards).toEqual([]);
  });

  it("remover o card esvazia o intervalo onde ele estava", () => {
    get().addCard("lab");
    const b = get().addBlock("Segunda")!;
    get().addSlot(free(b, "09:00", "10:00"));
    get().placeCard(get().cards[0].id, get().slots[0].id);
    get().removeCard(get().cards[0].id);
    expect(get().cards).toEqual([]);
    expect(get().slots[0].cardId).toBeNull();
  });
});

describe("blocos", () => {
  it("cria com o título aparado, qualquer nome serve", () => {
    const id = get().addBlock("  Manhã livre  ");
    expect(id).toBeTruthy();
    expect(get().blocks).toHaveLength(1);
    expect(get().blocks[0]).toMatchObject({ id, title: "Manhã livre" });
  });

  it("recusa título vazio", () => {
    expect(get().addBlock("   ")).toBeNull();
    expect(get().blocks).toEqual([]);
  });

  it("renomeia, mas não aceita nome vazio", () => {
    const id = get().addBlock("Segunda")!;
    get().renameBlock(id, " Terça ");
    expect(get().blocks[0].title).toBe("Terça");
    get().renameBlock(id, "  ");
    expect(get().blocks[0].title).toBe("Terça");
  });

  it("excluir o bloco leva os intervalos e devolve os cards pro topo", () => {
    get().addCard("lab");
    const a = get().addBlock("A")!;
    const b = get().addBlock("B")!;
    get().addSlot(free(a, "09:00", "10:00"));
    get().addSlot(free(b, "09:00", "10:00"));
    get().placeCard(get().cards[0].id, get().slots[0].id);
    get().removeBlock(a);
    expect(get().blocks.map((x) => x.id)).toEqual([b]);
    expect(get().slots).toHaveLength(1);
    expect(get().slots[0].blockId).toBe(b);
    expect(get().cards).toHaveLength(1);
    expect(get().slots.some((s) => s.cardId)).toBe(false);
  });
});

describe("cloneBlock", () => {
  function setup() {
    get().addCard("lab");
    const id = get().addBlock("Segunda")!;
    get().addBlock("Terça");
    get().addSlot(free(id, "09:00", "10:00"));
    get().addSlot(free(id, "10:00", "11:00"));
    get().addSlot({ blockId: id, start: "12:00", end: "13:00", kind: "busy", label: "Almoço" });
    get().placeCard(get().cards[0].id, get().slots[0].id);
    return id;
  }

  it("copia o bloco com todos os horários, logo depois do original", () => {
    const id = setup();
    const copyId = get().cloneBlock(id)!;
    expect(get().blocks.map((b) => b.title)).toEqual(["Segunda", "Segunda (cópia)", "Terça"]);
    const copied = get().slots.filter((s) => s.blockId === copyId);
    expect(copied.map((s) => [s.start, s.end, s.kind, s.label])).toEqual([
      ["09:00", "10:00", "free", undefined],
      ["10:00", "11:00", "free", undefined],
      ["12:00", "13:00", "busy", "Almoço"],
    ]);
  });

  it("a cópia nasce vazia: o card continua só no original", () => {
    const id = setup();
    const copyId = get().cloneBlock(id)!;
    expect(get().slots.filter((s) => s.blockId === copyId).every((s) => s.cardId === null)).toBe(true);
    expect(get().slots.filter((s) => s.cardId)).toHaveLength(1);
  });

  it("a cópia é independente: mexer nela não muda o original", () => {
    const id = setup();
    const copyId = get().cloneBlock(id)!;
    const ids = get().slots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    get().removeBlock(copyId);
    expect(get().slots.filter((s) => s.blockId === id)).toHaveLength(3);
  });

  it("clonar um bloco que não existe não faz nada", () => {
    expect(get().cloneBlock("nao-existe")).toBeNull();
    expect(get().blocks).toEqual([]);
  });
});

describe("addSlot", () => {
  it("adiciona um intervalo livre vazio", () => {
    const b = get().addBlock("Segunda")!;
    expect(get().addSlot(free(b, "09:00", "10:00"))).toBeNull();
    expect(get().slots[0]).toMatchObject({ blockId: b, kind: "free", cardId: null });
  });

  it("recusa intervalo que bate com outro do mesmo bloco, mas aceita em outro bloco", () => {
    const a = get().addBlock("A")!;
    const b = get().addBlock("B")!;
    get().addSlot(free(a, "09:00", "10:00"));
    expect(get().addSlot(free(a, "09:30", "10:30"))).toMatch(/bate/);
    expect(get().addSlot(free(b, "09:30", "10:30"))).toBeNull();
    expect(get().slots).toHaveLength(2);
  });

  it("recusa bloco que não existe", () => {
    expect(get().addSlot(free("fantasma", "09:00", "10:00"))).toMatch(/não existe/);
    expect(get().slots).toEqual([]);
  });

  it("bloco ocupado ganha o nome, ou 'Ocupado' se vier vazio", () => {
    const b = get().addBlock("Terça")!;
    get().addSlot({ blockId: b, start: "08:00", end: "12:00", kind: "busy", label: " Aula " });
    get().addSlot({ blockId: b, start: "13:00", end: "14:00", kind: "busy", label: "" });
    expect(get().slots.map((s) => s.label)).toEqual(["Aula", "Ocupado"]);
  });
});

describe("placeCard", () => {
  function setup() {
    get().addCard("a");
    get().addCard("b");
    const blk = get().addBlock("Segunda")!;
    get().addSlot(free(blk, "09:00", "10:00"));
    get().addSlot(free(blk, "10:00", "11:00"));
    get().addSlot({ blockId: blk, start: "12:00", end: "13:00", kind: "busy", label: "Almoço" });
    const [a, b] = get().cards;
    const [s1, s2, busy] = get().slots;
    return { a, b, s1, s2, busy };
  }

  it("encaixa o card no intervalo livre", () => {
    const { a, s1 } = setup();
    get().placeCard(a.id, s1.id);
    expect(get().slots[0].cardId).toBe(a.id);
  });

  it("mover o card libera o intervalo antigo", () => {
    const { a, s1, s2 } = setup();
    get().placeCard(a.id, s1.id);
    get().placeCard(a.id, s2.id);
    expect(get().slots[0].cardId).toBeNull();
    expect(get().slots[1].cardId).toBe(a.id);
  });

  it("soltar outro card num intervalo ocupado troca: o antigo volta pro topo", () => {
    const { a, b, s1 } = setup();
    get().placeCard(a.id, s1.id);
    get().placeCard(b.id, s1.id);
    expect(get().slots[0].cardId).toBe(b.id);
    expect(get().slots.some((s) => s.cardId === a.id)).toBe(false);
  });

  it("não encaixa em bloco ocupado, em intervalo ou card que não existe", () => {
    const { a, s1, busy } = setup();
    get().placeCard(a.id, busy.id);
    get().placeCard("nao-existe", s1.id);
    get().placeCard(a.id, "nao-existe");
    expect(get().slots.every((s) => s.cardId === null)).toBe(true);
  });

  it("unplaceCard devolve o card pro topo", () => {
    const { a, s1 } = setup();
    get().placeCard(a.id, s1.id);
    get().unplaceCard(a.id);
    expect(get().slots[0].cardId).toBeNull();
    expect(get().cards).toHaveLength(2);
  });

  it("remover o intervalo não apaga o card", () => {
    const { a, s1 } = setup();
    get().placeCard(a.id, s1.id);
    get().removeSlot(s1.id);
    expect(get().cards.some((c) => c.id === a.id)).toBe(true);
  });
});

describe("modelos", () => {
  const busy = (blockId: string, start: string, end: string, label: string) => ({ blockId, start, end, kind: "busy" as const, label });

  it("salva os horários do bloco, sem os cards, em ordem", () => {
    get().addCard("lab");
    const b = get().addBlock("Segunda")!;
    get().addSlot(free(b, "14:00", "16:00"));
    get().addSlot(busy(b, "08:00", "12:00", "aula"));
    get().placeCard(get().cards[0].id, get().slots[0].id);
    expect(get().saveTemplate(b, "Dia comum - universidade")).toBeNull();
    expect(get().templates).toHaveLength(1);
    expect(get().templates[0].slots).toEqual([
      { start: "08:00", end: "12:00", kind: "busy", label: "aula" },
      { start: "14:00", end: "16:00", kind: "free" },
    ]);
  });

  it("recusa nome vazio e bloco sem horários", () => {
    const b = get().addBlock("Vazio")!;
    expect(get().saveTemplate(b, "x")).toMatch(/horários/);
    get().addSlot(free(b, "09:00", "10:00"));
    expect(get().saveTemplate(b, "  ")).toMatch(/nome/i);
    expect(get().templates).toEqual([]);
  });

  it("salvar com o mesmo nome substitui, não duplica", () => {
    const b = get().addBlock("A")!;
    get().addSlot(free(b, "09:00", "10:00"));
    get().saveTemplate(b, "Dia");
    get().addSlot(free(b, "11:00", "12:00"));
    get().saveTemplate(b, "dia");
    expect(get().templates).toHaveLength(1);
    expect(get().templates[0].slots).toHaveLength(2);
  });

  it("cria um bloco novo a partir do modelo, com horários livres e vazios", () => {
    const b = get().addBlock("A")!;
    get().addSlot(busy(b, "08:00", "12:00", "aula"));
    get().saveTemplate(b, "Dia comum");
    const id = get().addBlockFromTemplate(get().templates[0].id)!;
    expect(get().blocks.find((x) => x.id === id)?.title).toBe("Dia comum");
    const mine = get().slots.filter((s) => s.blockId === id);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ start: "08:00", end: "12:00", kind: "busy", label: "aula", cardId: null });
    expect(mine[0].id).not.toBe(get().slots.find((s) => s.blockId === b)!.id);
  });

  it("aplica num bloco existente e pula o que bate", () => {
    const a = get().addBlock("A")!;
    get().addSlot(busy(a, "08:00", "12:00", "aula"));
    get().addSlot(free(a, "14:00", "16:00"));
    get().saveTemplate(a, "Dia");
    const b = get().addBlock("B")!;
    get().addSlot(free(b, "09:00", "10:00")); // bate com 08–12
    expect(get().applyTemplate(get().templates[0].id, b)).toBe(1);
    expect(get().slots.filter((s) => s.blockId === b).map((s) => s.start).sort()).toEqual(["09:00", "14:00"]);
  });

  it("excluir o modelo não mexe nos blocos já criados", () => {
    const a = get().addBlock("A")!;
    get().addSlot(free(a, "09:00", "10:00"));
    get().saveTemplate(a, "Dia");
    const id = get().addBlockFromTemplate(get().templates[0].id)!;
    get().removeTemplate(get().templates[0].id);
    expect(get().templates).toEqual([]);
    expect(get().slots.some((s) => s.blockId === id)).toBe(true);
  });
});
