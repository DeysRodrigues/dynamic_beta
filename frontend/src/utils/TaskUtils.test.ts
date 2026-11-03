import { describe, it, expect } from "vitest";
import { parseDuration, groupTasksByDate } from "./TaskUtils";
import type { Task } from "@/types/Task";

describe("parseDuration", () => {
  it("devolve 0 para vazio ou indefinido", () => {
    expect(parseDuration()).toBe(0);
    expect(parseDuration("")).toBe(0);
  });
  it("aceita número direto", () => expect(parseDuration(30)).toBe(30));
  it("converte '1:30' em 90", () => expect(parseDuration("1:30")).toBe(90));
  it("converte string numérica", () => expect(parseDuration("45")).toBe(45));
  it("devolve 0 para texto inválido", () => expect(parseDuration("abc")).toBe(0));
});

describe("groupTasksByDate", () => {
  const mk = (id: string, date: string): Task => ({
    id, date, description: id, tag: "", completed: false, duration: 15,
  });

  it("agrupa pela data", () => {
    const g = groupTasksByDate([mk("a", "2026-01-01"), mk("b", "2026-01-02"), mk("c", "2026-01-01")]);
    expect(Object.keys(g)).toEqual(["2026-01-01", "2026-01-02"]);
    expect(g["2026-01-01"].map((t) => t.id)).toEqual(["a", "c"]);
  });

  it("devolve objeto vazio sem tarefas", () => {
    expect(groupTasksByDate([])).toEqual({});
  });
});
