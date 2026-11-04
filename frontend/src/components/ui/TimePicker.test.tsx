import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimePicker from "./TimePicker";

function Harness({ initial = "", onValue }: { initial?: string; onValue?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <TimePicker
        ariaLabel="Início"
        value={value}
        onChange={(v) => {
          setValue(v);
          onValue?.(v);
        }}
        clearable
      />
      <button>fora</button>
    </>
  );
}

const field = () => screen.getByLabelText("Início") as HTMLInputElement;

describe("TimePicker", () => {
  it("digitar 2200 vira 22:00 sem esperar sair do campo", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    await user.type(field(), "2200");
    expect(onValue).toHaveBeenLastCalledWith("22:00");
    expect(field().value).toBe("22:00");
  });

  it("não reescreve o texto no meio da digitação (220 ainda não é horário)", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    await user.type(field(), "220");
    expect(field().value).toBe("220");
    expect(onValue).not.toHaveBeenCalled();
  });

  it("ao sair do campo, 930 vira 09:30 e 9 vira 09:00", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(field(), "930");
    await user.click(screen.getByText("fora"));
    expect(field().value).toBe("09:30");

    await user.clear(field());
    await user.type(field(), "9");
    await user.click(screen.getByText("fora"));
    expect(field().value).toBe("09:00");
  });

  it("texto que não é horário volta pro último valor bom", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness initial="08:15" onValue={onValue} />);
    await user.click(field());
    await user.keyboard("{Control>}a{/Control}99"); // troca tudo por 99, que não é hora
    await user.click(screen.getByText("fora"));
    expect(onValue).not.toHaveBeenCalled();
    expect(field().value).toBe("08:15");
  });

  it("apagar o texto limpa o horário", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness initial="08:15" onValue={onValue} />);
    await user.clear(field());
    expect(onValue).toHaveBeenLastCalledWith("");
  });

  it("escolhe hora e minuto no popup", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    await user.click(screen.getByRole("button", { name: /Escolher horário: Início/ }));

    const dialog = screen.getByRole("dialog", { name: "Escolher horário" });
    await user.click(within(dialog).getByRole("button", { name: "22 horas" }));
    expect(onValue).toHaveBeenLastCalledWith("22:00");
    await user.click(within(dialog).getByRole("button", { name: "30 minutos" }));
    expect(onValue).toHaveBeenLastCalledWith("22:30");

    // escolher o minuto fecha o popup e o campo mostra o horário
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(field().value).toBe("22:30");
  });

  it("mostra a hora e o minuto atuais marcados no popup", async () => {
    const user = userEvent.setup();
    render(<Harness initial="14:45" />);
    await user.click(screen.getByRole("button", { name: /Escolher horário/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "14 horas" })).toHaveAttribute("aria-pressed", "true");
    expect(within(dialog).getByRole("button", { name: "45 minutos" })).toHaveAttribute("aria-pressed", "true");
    expect(within(dialog).getByRole("button", { name: "13 horas" })).toHaveAttribute("aria-pressed", "false");
  });

  it("fecha com Escape e clicando fora", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: /Escolher horário/ });

    await user.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(opener);
    await user.click(screen.getByText("fora"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("o botão de limpar apaga o horário", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness initial="08:15" onValue={onValue} />);
    await user.click(screen.getByRole("button", { name: "Limpar horário" }));
    expect(onValue).toHaveBeenLastCalledWith("");
    expect(field().value).toBe("");
  });

  it("o popup abre fora do painel (portal no body), pra nada cortar", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Escolher horário/ }));
    const dialog = screen.getByRole("dialog");
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });
});
