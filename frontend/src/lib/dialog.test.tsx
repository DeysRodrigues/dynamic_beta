import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DialogHost from "@/components/ui/DialogHost";
import { alertDialog, confirmDialog, promptDialog, useDialogStore } from "./dialog";

afterEach(() => {
  useDialogStore.setState({ queue: [] });
  vi.restoreAllMocks();
});

describe("diálogos do app", () => {
  it("confirm resolve true no botão e false em Cancelar, sem usar o do navegador", async () => {
    const browser = vi.spyOn(window, "confirm");
    render(<DialogHost />);

    const yes = confirmDialog("Excluir isso?", { confirmLabel: "Excluir" });
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Excluir" }));
    await expect(yes).resolves.toBe(true);

    const no = confirmDialog("Excluir isso?");
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));
    await expect(no).resolves.toBe(false);
    expect(browser).not.toHaveBeenCalled();
  });

  it("Esc cancela o confirm e o prompt", async () => {
    render(<DialogHost />);
    const c = confirmDialog("Certeza?");
    await screen.findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    await expect(c).resolves.toBe(false);

    const p = promptDialog("Nome?");
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await expect(p).resolves.toBeNull();
  });

  it("prompt devolve o texto (com o valor inicial) e Enter envia", async () => {
    render(<DialogHost />);
    const answer = promptDialog("Nome da área?", { defaultValue: "Nova" });
    const input = await screen.findByRole("textbox");
    expect(input).toHaveValue("Nova");
    await userEvent.type(input, "s{Enter}");
    await expect(answer).resolves.toBe("Novas");
  });

  it("alert mostra o aviso e resolve ao fechar", async () => {
    render(<DialogHost />);
    const done = alertDialog("Preencha o nome.");
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Preencha o nome.");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(done).resolves.toBeUndefined();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("vários seguidos entram em fila, um de cada vez", async () => {
    render(<DialogHost />);
    const first = alertDialog("primeiro");
    const second = alertDialog("segundo");
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("primeiro");
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    await first;
    expect(await screen.findByText("segundo")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    await second;
  });

  it("sem o host montado, cai no diálogo do navegador em vez de travar", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await expect(confirmDialog("x")).resolves.toBe(true);
  });
});
