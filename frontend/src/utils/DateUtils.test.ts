import { describe, it, expect, vi, afterEach } from "vitest";
import { getTodayDate, getDaysArray, formatDate } from "./DateUtils";

afterEach(() => vi.useRealTimers());

describe("getTodayDate", () => {
  it("usa a data local, não a UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 10, 23, 30)); // 10/05 23:30 local
    expect(getTodayDate()).toBe("2026-05-10");
  });
});

describe("getDaysArray", () => {
  it("inclui início e fim", () => {
    expect(getDaysArray("2026-01-01", "2026-01-01")).toEqual(["2026-01-01"]);
    expect(getDaysArray("2026-01-30", "2026-02-02")).toHaveLength(4);
  });
  it("é vazio quando o fim vem antes do início", () => {
    expect(getDaysArray("2026-01-05", "2026-01-01")).toEqual([]);
  });
});

describe("formatDate", () => {
  it("devolve vazio para string vazia", () => expect(formatDate("")).toBe(""));
  it("formata em pt-BR com dia e mês", () => {
    const out = formatDate("2026-01-01");
    expect(out).toMatch(/01/);
    expect(out.toLowerCase()).toMatch(/jan/);
  });
});
