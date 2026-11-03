import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, act } from "@testing-library/react";
import PixelGardenBox from "./PixelGardenBox";
import { useTaskStore } from "@/store/useTaskStore";
import { getTodayDate } from "@/utils/DateUtils";
import type { Task } from "@/types/Task";

const task = (n: number, completed = true, date = getTodayDate()): Task => ({
  id: `t${n}`, description: `tarefa ${n}`, tag: "", completed, date, duration: 15,
});

beforeEach(() => useTaskStore.setState({ tasks: [] }));

describe("PixelGardenBox", () => {
  it("sem tarefas feitas mostra o vaso vazio, no nível 0", () => {
    render(<PixelGardenBox />);
    expect(screen.getByText("Nv. 0")).toBeInTheDocument();
    expect(screen.getByText("O vaso espera...")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Planta no estágio 0 de 4");
  });

  it("a planta cresce conforme as tarefas de hoje são concluídas", () => {
    render(<PixelGardenBox />);
    const sizes: number[] = [];
    for (const done of [0, 1, 3, 5, 8]) {
      act(() => useTaskStore.setState({ tasks: Array.from({ length: done }, (_, i) => task(i)) }));
      sizes.push(screen.getByRole("img").querySelectorAll("rect").length);
    }
    expect(screen.getByText("Jardim lendário!")).toBeInTheDocument();
    expect(screen.getByText("Nv. 4")).toBeInTheDocument();
    expect(sizes[1]).toBeGreaterThan(sizes[0]);
    expect(sizes[4]).toBeGreaterThan(sizes[2]);
  });

  it("só conta tarefas concluídas e de hoje", () => {
    useTaskStore.setState({ tasks: [task(1, false), task(2, true, "2020-01-01"), task(3, true)] });
    render(<PixelGardenBox />);
    expect(screen.getByText("Nv. 1")).toBeInTheDocument();
    expect(screen.getByText("1 tarefa feita hoje")).toBeInTheDocument();
  });

  it("o desenho usa a paleta pixel, sem depender de variáveis de tema", () => {
    const { container } = render(<PixelGardenBox />);
    const fills = [...container.querySelectorAll("rect")].map((r) => r.getAttribute("fill"));
    expect(fills.every((f) => /^#[0-9a-f]{6}$/i.test(f ?? ""))).toBe(true);
  });

  it("os brilhos só aparecem quando a planta está viçosa", () => {
    useTaskStore.setState({ tasks: [task(1)] });
    const { container, rerender } = render(<PixelGardenBox />);
    expect(container.querySelectorAll(".pixel-twinkle")).toHaveLength(0);
    act(() => useTaskStore.setState({ tasks: Array.from({ length: 5 }, (_, i) => task(i)) }));
    rerender(<PixelGardenBox />);
    expect(container.querySelectorAll(".pixel-twinkle").length).toBeGreaterThan(0);
  });

  it("a planta não dá zoom nenhum: nem ao passar o mouse, nem em animação", () => {
    render(<PixelGardenBox />);
    const cls = screen.getByRole("img").getAttribute("class") ?? "";
    expect(cls).not.toMatch(/scale|transition|animate|breathe/);
  });

  it("nenhum estilo do jardim aumenta e diminui a planta", () => {
    const css = readFileSync(resolve(__dirname, "../../../index.css"), "utf8");
    expect(css).not.toMatch(/breathe|pixel-zoom/);
    expect(readFileSync(resolve(__dirname, "PixelGardenBox.tsx"), "utf8")).not.toMatch(/hover:scale|group-hover:scale|scale-1/);
  });
});
