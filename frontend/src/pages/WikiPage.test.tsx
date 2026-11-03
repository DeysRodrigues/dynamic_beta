import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import WikiPage from "./WikiPage";

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <WikiPage />
    </MemoryRouter>
  );

describe("Wiki: ter o seu servidor", () => {
  it("sem parâmetro abre na introdução", () => {
    renderAt("/wiki");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("O que é o Dyna?");
  });

  it("o link da página de Conta (?secao=server) abre direto nessa seção", () => {
    renderAt("/wiki?secao=server");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ter o seu servidor (conta e banco)");
  });

  it("uma seção que não existe cai na introdução", () => {
    renderAt("/wiki?secao=nao-existe");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("O que é o Dyna?");
  });

  it("traz os 4 passos com os comandos para copiar", () => {
    renderAt("/wiki?secao=server");
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(screen.getByText("Instale o Docker")).toBeInTheDocument();
    expect(screen.getByText(/git clone https:\/\/github\.com\/DeysRodrigues\/dynamic_beta\.git/)).toBeInTheDocument();
    expect(screen.getByText(/openssl rand -hex 32/)).toBeInTheDocument();
    expect(screen.getByText("docker compose up --build -d")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Copiar" })).toHaveLength(3);
  });

  it("o botão copiar manda o comando para a área de transferência", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderAt("/wiki?secao=server");

    const block = screen.getByText("docker compose up --build -d").closest("div")!;
    await user.click(within(block).getByRole("button", { name: "Copiar" }));
    expect(writeText).toHaveBeenCalledWith("docker compose up --build -d");
  });

  it("explica as duas opções depois de ligar, e as dicas de segurança", () => {
    renderAt("/wiki?secao=server");
    expect(screen.getByText("Depois de ligar, duas opções")).toBeInTheDocument();
    expect(screen.getByText("App do Docker")).toBeInTheDocument();
    expect(screen.getByText("Site publicado")).toBeInTheDocument();
    expect(screen.getByText(/CORS_ORIGINS=https:\/\/dynabox\.space/)).toBeInTheDocument();
    expect(screen.getByText(/ALLOW_REGISTRATION=false/)).toBeInTheDocument();
    expect(screen.getByText(/O login dura 14 dias/)).toBeInTheDocument();
  });

  it("aparece na lista do menu lateral, e dá para abrir clicando", async () => {
    const user = userEvent.setup();
    renderAt("/wiki");
    await user.click(screen.getByRole("button", { name: /Ter o seu servidor/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ter o seu servidor");
  });

  it("a busca por 'docker' encontra a seção", async () => {
    const user = userEvent.setup();
    renderAt("/wiki");
    await user.type(screen.getByPlaceholderText("Buscar..."), "docker");
    expect(screen.getByRole("button", { name: /Ter o seu servidor/ })).toBeInTheDocument();
  });

  it("as outras seções seguem com o título de sempre nos detalhes", async () => {
    renderAt("/wiki?secao=shortcuts");
    expect(screen.getByText("Sintaxe & Parâmetros")).toBeInTheDocument();
    expect(screen.queryByText("Passo a passo")).not.toBeInTheDocument();
  });

  it("a seção da novidade (?secao=news) abre direto, como o sininho manda", () => {
    renderAt("/wiki?secao=news");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Novidade: conta e banco de dados");
    expect(screen.getByText("Login de 14 dias")).toBeInTheDocument();
  });
});
