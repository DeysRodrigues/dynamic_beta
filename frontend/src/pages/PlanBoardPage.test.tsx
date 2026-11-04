import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanBoardPage from "./PlanBoardPage";
import { usePlanBoardStore } from "@/store/usePlanBoardStore";

type User = ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usePlanBoardStore.setState({ cards: [], blocks: [], slots: [] });
  vi.restoreAllMocks();
});

async function createBlock(user: User, title: string) {
  await user.type(screen.getByLabelText("Título do novo bloco"), title);
  await user.click(screen.getByRole("button", { name: /Bloco/ }));
}

async function addSlot(user: User, block: string, start: string, end: string) {
  // The form stays open after an interval is added, so several can be entered in a row.
  const opener = screen.queryByRole("button", { name: `Novo intervalo, ${block}` });
  if (opener) await user.click(opener);
  await user.type(screen.getByLabelText(`Início, ${block}`), start);
  await user.type(screen.getByLabelText(`Fim, ${block}`), end);
  await user.click(screen.getByRole("button", { name: "Adicionar intervalo" }));
}

describe("PlanBoardPage", () => {
  it("começa sem blocos e mostra o convite pra criar o primeiro", () => {
    render(<PlanBoardPage />);
    expect(screen.getByText(/Nenhum bloco ainda/)).toBeInTheDocument();
  });

  it("cria blocos com o título que a pessoa quiser, não só dia da semana", async () => {
    const user = userEvent.setup();
    render(<PlanBoardPage />);
    await createBlock(user, "Manhã livre");
    await createBlock(user, "Sábado de estudo");
    expect(screen.getByLabelText("Título do bloco Manhã livre")).toBeInTheDocument();
    expect(screen.getByLabelText("Título do bloco Sábado de estudo")).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum bloco ainda/)).not.toBeInTheDocument();
  });

  it("cria card, cria intervalo livre e encaixa o card clicando", async () => {
    const user = userEvent.setup();
    render(<PlanBoardPage />);

    await user.type(screen.getByLabelText("Nome da nova task"), "lab ds");
    await user.click(screen.getByRole("button", { name: /Card/ }));
    expect(screen.getByText("lab ds")).toBeInTheDocument();

    await createBlock(user, "Segunda");
    await addSlot(user, "Segunda", "0900", "1000");
    expect(screen.getByText(/09:00 – 10:00/)).toBeInTheDocument();

    await user.click(screen.getByText("lab ds")); // select
    await user.click(screen.getByText(/Clique pra encaixar aqui/)); // place

    expect(usePlanBoardStore.getState().slots[0].cardId).toBe(usePlanBoardStore.getState().cards[0].id);
    expect(screen.getAllByText("lab ds")).toHaveLength(1); // left the pool, now in the slot
  });

  it("clona um bloco com os horários, sem levar o card", async () => {
    const user = userEvent.setup();
    render(<PlanBoardPage />);
    await createBlock(user, "Segunda");
    await addSlot(user, "Segunda", "0900", "1000");
    await addSlot(user, "Segunda", "1400", "1500");

    await user.click(screen.getByRole("button", { name: "Clonar Segunda" }));

    expect(screen.getByLabelText("Título do bloco Segunda (cópia)")).toBeInTheDocument();
    expect(screen.getAllByText(/09:00 – 10:00/)).toHaveLength(2);
    expect(screen.getAllByText(/14:00 – 15:00/)).toHaveLength(2);
    expect(usePlanBoardStore.getState().slots).toHaveLength(4);
  });

  it("renomeia o bloco ao sair do campo", async () => {
    const user = userEvent.setup();
    render(<PlanBoardPage />);
    await createBlock(user, "Segunda");
    const input = screen.getByLabelText("Título do bloco Segunda");
    await user.clear(input);
    await user.type(input, "Terça{Enter}");
    expect(usePlanBoardStore.getState().blocks[0].title).toBe("Terça");
  });

  it("excluir bloco com horários pede confirmação e respeita o 'não'", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<PlanBoardPage />);
    await createBlock(user, "Segunda");
    await addSlot(user, "Segunda", "0900", "1000");

    await user.click(screen.getByRole("button", { name: "Excluir Segunda" }));
    expect(confirm).toHaveBeenCalled();
    expect(usePlanBoardStore.getState().blocks).toHaveLength(1);

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Excluir Segunda" }));
    expect(usePlanBoardStore.getState().blocks).toHaveLength(0);
    expect(usePlanBoardStore.getState().slots).toHaveLength(0);
  });

  it("excluir bloco vazio não pergunta nada", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm");
    render(<PlanBoardPage />);
    await createBlock(user, "Segunda");
    await user.click(screen.getByRole("button", { name: "Excluir Segunda" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(usePlanBoardStore.getState().blocks).toHaveLength(0);
  });

  it("tirar o card do intervalo devolve ele pro topo", async () => {
    const user = userEvent.setup();
    const s = usePlanBoardStore.getState();
    s.addCard("estudar inglês");
    const b = s.addBlock("Segunda")!;
    s.addSlot({ blockId: b, start: "09:00", end: "10:00", kind: "free" });
    usePlanBoardStore.getState().placeCard(usePlanBoardStore.getState().cards[0].id, usePlanBoardStore.getState().slots[0].id);
    render(<PlanBoardPage />);

    await user.click(screen.getByRole("button", { name: /Tirar estudar inglês/ }));
    expect(usePlanBoardStore.getState().slots[0].cardId).toBeNull();
    expect(within(screen.getByText("sem horário").parentElement!).getByText("1")).toBeInTheDocument();
  });

  it("avisa quando o intervalo bate com outro e não cria", async () => {
    const user = userEvent.setup();
    render(<PlanBoardPage />);
    await createBlock(user, "Terça");
    await addSlot(user, "Terça", "0900", "1000");
    await addSlot(user, "Terça", "0930", "1030");
    expect(await screen.findByRole("alert")).toHaveTextContent(/09:00–10:00/);
    expect(usePlanBoardStore.getState().slots).toHaveLength(1);
  });

  it("aceita intervalo de 22:00 até 00:00 e mostra que vira o dia", async () => {
    const user = userEvent.setup();
    render(<PlanBoardPage />);
    await createBlock(user, "Noite");
    await addSlot(user, "Noite", "2200", "0000");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(usePlanBoardStore.getState().slots).toHaveLength(1);
    expect(screen.getByText("+1 dia")).toBeInTheDocument();
    expect(screen.getAllByText("2h").length).toBeGreaterThan(0);
  });

  it("não deixa encaixar card em bloco ocupado", async () => {
    const user = userEvent.setup();
    const s = usePlanBoardStore.getState();
    s.addCard("lab");
    const b = s.addBlock("Segunda")!;
    s.addSlot({ blockId: b, start: "08:00", end: "12:00", kind: "busy", label: "Aula" });
    render(<PlanBoardPage />);

    await user.click(screen.getByText("lab"));
    await user.click(screen.getByText("Aula"));
    expect(usePlanBoardStore.getState().slots[0].cardId).toBeNull();
  });
});
