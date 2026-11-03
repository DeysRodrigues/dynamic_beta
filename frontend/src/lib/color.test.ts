import { describe, it, expect } from "vitest";
import { isDarkColor } from "./color";

describe("isDarkColor", () => {
  it.each([
    ["#020617", true], ["#0f172a", true], ["#000", true], ["#2e2a45", true], ["#18181b", true],
    ["#ffffff", false], ["#fff", false], ["#f9fafb", false], ["#e0f2fe", false], ["#dbeafe", false],
  ])("hex %s -> dark=%s", (c, dark) => expect(isDarkColor(c)).toBe(dark));

  it("entende rgb e hsl", () => {
    expect(isDarkColor("rgb(10, 10, 20)")).toBe(true);
    expect(isDarkColor("rgb(240 240 240)")).toBe(false);
    expect(isDarkColor("hsl(222.2 47.4% 11.2%)")).toBe(true);
    expect(isDarkColor("hsl(0 0% 100%)")).toBe(false);
  });

  it("ignora maiúsculas e espaços", () => {
    expect(isDarkColor("  #0F172A ")).toBe(true);
  });

  it("cor que não consegue ler conta como clara", () => {
    expect(isDarkColor("var(--x)")).toBe(false);
    expect(isDarkColor("papayawhip")).toBe(false);
    expect(isDarkColor("")).toBe(false);
  });

  it("não depende do primeiro dígito do hex, como a regra antiga", () => {
    // "#2e..." é claro o bastante para a regra antiga errar; "#1f2937" é escuro.
    expect(isDarkColor("#1f2937")).toBe(true);
    expect(isDarkColor("#2ee6a8")).toBe(false);
  });
});
