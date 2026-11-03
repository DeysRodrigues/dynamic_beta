import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectModal from "./ProjectModal";
import { useProjectStore } from "@/store/useProjectStore";

beforeEach(() => useProjectStore.setState({ projects: [], activeProjectId: null }));

describe("ProjectModal e o tamanho dos widgets", () => {
  it("o projeto criado já nasce com posição e altura para cada widget", async () => {
    render(<ProjectModal isOpen onClose={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText("Ex: Projeto Emagrecer"), "TCC");
    await userEvent.click(screen.getByText("Confirmar Projeto"));

    const project = useProjectStore.getState().projects[0];
    expect(project.boxes.map((b) => b.type)).toEqual(["project_overview", "tasks"]);
    for (const bp of ["lg", "md", "sm"]) {
      const items = project.layouts[bp];
      expect(items).toHaveLength(2);
      expect(items.find((i) => i.i === project.boxes[0].id)!.h).toBe(5); // visão geral
      expect(items.find((i) => i.i === project.boxes[1].id)!.h).toBe(3); // tarefas
    }
  });

  it("ao editar, o widget novo ganha layout e o removido perde", async () => {
    const first = render(<ProjectModal isOpen onClose={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText("Ex: Projeto Emagrecer"), "A");
    await userEvent.click(screen.getByText("Confirmar Projeto"));
    first.unmount();
    const created = useProjectStore.getState().projects[0];

    const { unmount } = render(<ProjectModal isOpen onClose={() => {}} projectToEdit={created} />);
    await userEvent.click(screen.getByText("Bloco de Notas")); // liga
    await userEvent.click(screen.getByText("Salvar Projeto"));
    unmount();

    const edited = useProjectStore.getState().projects[0];
    expect(edited.boxes.map((b) => b.type)).toContain("notepad");
    const notepad = edited.boxes.find((b) => b.type === "notepad")!;
    expect(edited.layouts.lg.find((i) => i.i === notepad.id)!.h).toBe(4);
  });
});
