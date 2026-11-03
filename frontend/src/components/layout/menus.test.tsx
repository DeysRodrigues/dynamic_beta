import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeApplicator } from "./ThemeApplicator";
import TaskItem from "@/components/ui/TaskItem";
import { useThemeStore } from "@/store/useThemeStore";
import type { Task } from "@/types/Task";

const task: Task = { id: "1", description: "Estudar", tag: "", completed: false, date: "2026-01-01", duration: 30 };

describe("menus seguem o tema", () => {
  it("o --popover é derivado da cor do widget, não um branco fixo", () => {
    const css = readFileSync(resolve(__dirname, "../../theme.css"), "utf8");
    const popover = css.match(/--popover:\s*([^;]+);/)![1];
    expect(popover).toContain("var(--box-color");
    expect(popover).not.toMatch(/hsl\(0 0% 100%\)/);
    expect(css.match(/--popover-foreground:\s*([^;]+);/)![1]).toContain("var(--box-text-color");
  });

  it("o menu de três pontinhos da tarefa usa as cores do popover e tem Editar e Excluir", async () => {
    render(<TaskItem task={task} onEdit={() => {}} onDelete={() => {}} />);
    await userEvent.click(screen.getByTitle("Opções"));
    const menu = screen.getByText("Editar").closest("div.absolute")!;
    expect(menu.className).toContain("bg-popover");
    expect(menu.className).toContain("text-popover-foreground");
    expect(screen.getByText("Excluir")).toBeInTheDocument();
  });
});

describe("ThemeApplicator e o esquema de cores do navegador", () => {
  beforeEach(() => document.documentElement.style.removeProperty("color-scheme"));

  it("tema escuro pede controles nativos escuros", () => {
    useThemeStore.setState({ backgroundColor: "#020617", boxColor: "#0f172a", textColor: "#e2e8f0" });
    render(<ThemeApplicator />);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--calendar-invert")).toBe("1");
  });

  it("tema claro pede controles claros", () => {
    useThemeStore.setState({ backgroundColor: "#f9fafb", boxColor: "#ffffff", textColor: "#1e293b" });
    render(<ThemeApplicator />);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.documentElement.style.getPropertyValue("--calendar-invert")).toBe("0");
  });
});
