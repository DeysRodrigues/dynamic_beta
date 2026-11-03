import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotepadBox from "./NotepadBox";
import { useBoxContentStore } from "@/store/useBoxContentStore";

beforeEach(() => useBoxContentStore.setState({ contents: {} }));

describe("NotepadBox", () => {
  it("abre editando, com a caixa de texto", () => {
    render(<NotepadBox id="notepad-t1" />);
    expect(screen.getByPlaceholderText(/aceita markdown/)).toBeInTheDocument();
  });

  it("alterna para a visualização e renderiza o markdown", async () => {
    render(<NotepadBox id="notepad-t2" />);
    await userEvent.type(screen.getByPlaceholderText(/aceita markdown/), "# Oi{enter}texto **forte**");
    await userEvent.click(screen.getByTitle("Visualizar markdown"));

    expect(screen.getByRole("heading", { name: "Oi" })).toBeInTheDocument();
    expect(screen.getByText("forte").tagName).toBe("STRONG");
    expect(screen.queryByPlaceholderText(/aceita markdown/)).not.toBeInTheDocument();
  });

  it("marcar um item na visualização altera o texto salvo", async () => {
    useBoxContentStore.setState({ contents: { "notepad-t3": { text: "- [ ] comprar\n- [ ] ligar", view: "preview" } } });
    render(<NotepadBox id="notepad-t3" />);

    await userEvent.click(screen.getAllByRole("checkbox")[1]);
    await act(async () => { await new Promise((r) => setTimeout(r, 1100)); });

    expect(useBoxContentStore.getState().contents["notepad-t3"]).toMatchObject({ text: "- [ ] comprar\n- [x] ligar" });
  });

  it("lembra a visualização escolhida", async () => {
    render(<NotepadBox id="notepad-t4" />);
    await userEvent.click(screen.getByTitle("Visualizar markdown"));
    await act(async () => { await new Promise((r) => setTimeout(r, 1100)); });
    expect(useBoxContentStore.getState().contents["notepad-t4"]).toMatchObject({ view: "preview" });
  });

  it("nota vazia em visualização mostra o aviso", () => {
    useBoxContentStore.setState({ contents: { "notepad-t5": { view: "preview" } } });
    render(<NotepadBox id="notepad-t5" />);
    expect(screen.getByText("Nada para mostrar ainda.")).toBeInTheDocument();
  });
});
