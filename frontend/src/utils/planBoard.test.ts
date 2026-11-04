import { describe, it, expect } from "vitest";
import { toMinutes, slotMinutes, slotRange, crossesMidnight, formatDuration, sortSlots, validateSlot, migratePlanBoard, type PlanSlot } from "./planBoard";

const slot = (over: Partial<PlanSlot> = {}): PlanSlot => ({
  id: "a",
  blockId: "b1",
  start: "09:00",
  end: "10:00",
  kind: "free",
  cardId: null,
  ...over,
});

describe("toMinutes", () => {
  it("converte HH:mm", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("08:30")).toBe(510);
    expect(toMinutes("23:59")).toBe(1439);
  });

  it("recusa o que não é horário", () => {
    for (const bad of ["", "8:30", "24:00", "12:60", "ab:cd", "12:3"]) expect(toMinutes(bad)).toBeNull();
  });
});

describe("slotMinutes e formatDuration", () => {
  it("calcula a duração do intervalo", () => {
    expect(slotMinutes(slot({ start: "14:00", end: "15:30" }))).toBe(90);
  });

  it("fim menor que o início vira a meia-noite: 22:00 até 00:00 são 2h", () => {
    expect(slotMinutes(slot({ start: "22:00", end: "00:00" }))).toBe(120);
    expect(slotMinutes(slot({ start: "23:00", end: "01:30" }))).toBe(150);
    expect(slotMinutes(slot({ start: "00:00", end: "06:00" }))).toBe(360);
  });

  it("início igual ao fim não é intervalo, nem vira 24h", () => {
    expect(slotRange(slot({ start: "10:00", end: "10:00" }))).toBeNull();
    expect(slotMinutes(slot({ start: "10:00", end: "10:00" }))).toBe(0);
  });

  it("sabe quando o intervalo passa da meia-noite", () => {
    expect(crossesMidnight(slot({ start: "22:00", end: "00:00" }))).toBe(true);
    expect(crossesMidnight(slot({ start: "23:30", end: "00:30" }))).toBe(true);
    expect(crossesMidnight(slot({ start: "09:00", end: "10:00" }))).toBe(false);
    expect(crossesMidnight(slot({ start: "10:00", end: "10:00" }))).toBe(false);
  });

  it("formata a duração", () => {
    expect(formatDuration(45)).toBe("45min");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h30");
    expect(formatDuration(125)).toBe("2h05");
  });
});

describe("sortSlots", () => {
  it("ordena pelo início sem mexer no original", () => {
    const list = [slot({ id: "b", start: "14:00" }), slot({ id: "a", start: "08:00" })];
    expect(sortSlots(list).map((s) => s.id)).toEqual(["a", "b"]);
    expect(list[0].id).toBe("b");
  });
});

describe("validateSlot", () => {
  const base = { blockId: "b1", kind: "free" as const };

  it("aceita um intervalo livre", () => {
    expect(validateSlot([], { ...base, start: "09:00", end: "10:00" })).toBeNull();
  });

  it("exige horários válidos", () => {
    expect(validateSlot([], { ...base, start: "", end: "10:00" })).toMatch(/Preencha/);
  });

  it("recusa fim igual ao início", () => {
    expect(validateSlot([], { ...base, start: "10:00", end: "10:00" })).toMatch(/igual ao início/);
  });

  it("aceita intervalo que passa da meia-noite", () => {
    expect(validateSlot([], { ...base, start: "22:00", end: "00:00" })).toBeNull();
    expect(validateSlot([], { ...base, start: "23:00", end: "01:00" })).toBeNull();
  });

  it("intervalo que passa da meia-noite também não pode bater com outro", () => {
    const existing = [slot({ start: "22:00", end: "00:00" })];
    expect(validateSlot(existing, { ...base, start: "23:00", end: "23:30" })).toMatch(/22:00–00:00/);
    expect(validateSlot(existing, { ...base, start: "21:00", end: "22:30" })).not.toBeNull();
    expect(validateSlot(existing, { ...base, start: "20:00", end: "22:00" })).toBeNull(); // só encosta
  });

  it("recusa sobreposição no mesmo dia", () => {
    const existing = [slot({ start: "09:00", end: "10:00" })];
    expect(validateSlot(existing, { ...base, start: "09:30", end: "10:30" })).toMatch(/09:00–10:00/);
    expect(validateSlot(existing, { ...base, start: "08:00", end: "11:00" })).not.toBeNull();
  });

  it("deixa os intervalos se encostarem", () => {
    const existing = [slot({ start: "09:00", end: "10:00" })];
    expect(validateSlot(existing, { ...base, start: "10:00", end: "11:00" })).toBeNull();
    expect(validateSlot(existing, { ...base, start: "08:00", end: "09:00" })).toBeNull();
  });

  it("não compara com outro bloco", () => {
    const existing = [slot({ blockId: "b2" })];
    expect(validateSlot(existing, { ...base, start: "09:00", end: "10:00" })).toBeNull();
  });

  it("ignora o próprio intervalo ao editar", () => {
    const existing = [slot({ id: "x" })];
    expect(validateSlot(existing, { ...base, start: "09:00", end: "10:30" }, "x")).toBeNull();
  });
});

describe("migratePlanBoard", () => {
  const card = { id: "c", title: "t", color: "#fff" };
  const old = (day: number, id: string) => ({ id, day, start: "09:00", end: "10:00", kind: "free", cardId: null });

  it("vira um bloco por dia usado, com o nome do dia, e mantém os horários", () => {
    const out = migratePlanBoard({ cards: [card], slots: [old(2, "s1"), old(0, "s2"), old(2, "s3")], showWeekend: false }, 1) as {
      cards: unknown[];
      blocks: Array<{ id: string; title: string }>;
      slots: Array<{ id: string; blockId: string; day?: number }>;
    };
    expect(out.cards).toEqual([card]);
    expect(out.blocks.map((b) => b.title)).toEqual(["Segunda", "Quarta"]);
    expect(out.slots.map((s) => [s.id, s.blockId])).toEqual([["s1", "day-2"], ["s2", "day-0"], ["s3", "day-2"]]);
    expect(out.slots.every((s) => !("day" in s))).toBe(true);
    for (const s of out.slots) expect(out.blocks.some((b) => b.id === s.blockId)).toBe(true);
  });

  it("não mexe em dado que já é da versão nova nem em lixo", () => {
    const fresh = { cards: [], blocks: [], slots: [] };
    expect(migratePlanBoard(fresh, 2)).toBe(fresh);
    expect(migratePlanBoard(null, 1)).toBeNull();
  });

  it("dado antigo vazio vira quadro vazio", () => {
    expect(migratePlanBoard({}, 1)).toEqual({ cards: [], blocks: [], slots: [] });
  });
});
