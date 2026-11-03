import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import ProjectsPage from "@/pages/ProjectsPage";
import { useProjectStore } from "@/store/useProjectStore";

describe("EmptyState", () => {
  it("mostra título, dica e ação", async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Nada aqui" hint="Crie algo" action={<button onClick={onClick}>Criar</button>} />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Crie algo")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Criar"));
    expect(onClick).toHaveBeenCalled();
  });

  it("é um painel preenchido, sem contorno", () => {
    const { container } = render(<EmptyState title="x" />);
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("bg-current/5");
    expect(cls).not.toMatch(/border|dashed/);
  });

  it("a página de projetos vazia usa o estado vazio padrão", () => {
    useProjectStore.setState({ projects: [], activeProjectId: null });
    render(<MemoryRouter><ProjectsPage /></MemoryRouter>);
    expect(screen.getByText("Nenhum projeto encontrado")).toBeInTheDocument();
    expect(screen.getByText("Criar meu primeiro projeto")).toBeInTheDocument();
  });
});
