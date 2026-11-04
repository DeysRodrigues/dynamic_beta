import { describe, it, expect } from "vitest";
import { parseTimeInput, isFinishedTyping, HOURS, MINUTES } from "./timeInput";

describe("parseTimeInput", () => {
  it("lê os jeitos comuns de escrever um horário", () => {
    for (const [text, out] of [
      ["22:00", "22:00"],
      ["2200", "22:00"],
      ["22h00", "22:00"],
      ["22.00", "22:00"],
      ["9:30", "09:30"],
      ["930", "09:30"],
      ["0930", "09:30"],
      ["00:00", "00:00"],
      ["  7:05 ", "07:05"],
    ]) expect(parseTimeInput(text)).toBe(out);
  });

  it("recusa o que não é horário", () => {
    for (const bad of ["", "abc", "24:00", "12:60", "2460", "9:3", "99", "12:345", "1:2:3"]) expect(parseTimeInput(bad)).toBeNull();
  });

  it("só aceita a hora sozinha quando pedido", () => {
    expect(parseTimeInput("9")).toBeNull();
    expect(parseTimeInput("9", true)).toBe("09:00");
    expect(parseTimeInput("22", true)).toBe("22:00");
    expect(parseTimeInput("25", true)).toBeNull();
  });
});

describe("isFinishedTyping", () => {
  it("só considera pronto o que não pode mais virar outro horário", () => {
    expect(isFinishedTyping("2200")).toBe(true);
    expect(isFinishedTyping("22:00")).toBe(true);
    expect(isFinishedTyping("9:30")).toBe(true);
    expect(isFinishedTyping("220")).toBe(false); // ainda a caminho de 2200
    expect(isFinishedTyping("22")).toBe(false);
    expect(isFinishedTyping("22:0")).toBe(false);
  });
});

describe("listas do seletor", () => {
  it("24 horas e minutos de 5 em 5", () => {
    expect(HOURS).toHaveLength(24);
    expect(HOURS[0]).toBe("00");
    expect(HOURS[23]).toBe("23");
    expect(MINUTES).toEqual(["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]);
  });
});
