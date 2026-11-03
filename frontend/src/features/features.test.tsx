import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./dashboard/DashboardPage";
import Sidebar from "./sidebar/Sidebar";
import { useDashboardStore, selectActiveWorkspace } from "@/store/useDashboardStore";

// react-grid-layout measures its container; jsdom has no layout, so give it a width.
vi.mock("react-grid-layout", async () => {
  const actual = await vi.importActual<typeof import("react-grid-layout")>("react-grid-layout");
  return { ...actual, WidthProvider: <P,>(C: React.ComponentType<P>) => (props: P) => <C {...props} width={1200} /> };
});

const initial = useDashboardStore.getState();
const active = () => selectActiveWorkspace(useDashboardStore.getState())!;

beforeEach(() => {
  useDashboardStore.setState(initial, true);
  useDashboardStore.getState().resetDashboard();
});

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe("DashboardPage", () => {
  it("mostra a saudação, as abas e o botão de adicionar", () => {
    renderDashboard();
    expect(screen.getByText(/Bom dia|Boa tarde|Boa noite/)).toBeInTheDocument();
    expect(screen.getByText("Principal")).toBeInTheDocument();
    expect(screen.getByText("Adicionar")).toBeInTheDocument();
  });

  it("o menu Adicionar cria o widget no workspace ativo", async () => {
    renderDashboard();
    const before = active().boxes.length;
    await userEvent.click(screen.getByText("Adicionar"));
    await userEvent.click(screen.getByText("Notas"));
    expect(active().boxes).toHaveLength(before + 1);
    expect(active().boxes.at(-1)!.type).toBe("notepad");
  });

  it("o widget adicionado pelo menu nasce com a altura que o widget declara", async () => {
    renderDashboard();
    await userEvent.click(screen.getByText("Adicionar"));
    await userEvent.click(screen.getByText("Notas"));
    const lg = active().layouts.lg;
    expect(lg[lg.length - 1].h).toBe(4);
  });

  it("o botão de foco liga o modo foco", async () => {
    renderDashboard();
    await userEvent.click(screen.getByTitle("Modo Foco (F)"));
    expect(useDashboardStore.getState().isFocusMode).toBe(true);
    expect(screen.getByText("SAIR DO FOCO")).toBeInTheDocument();
  });

  it("a tecla F alterna o modo foco, e Escape sai dele", () => {
    renderDashboard();
    fireEvent.keyDown(window, { key: "f" });
    expect(useDashboardStore.getState().isFocusMode).toBe(true);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(useDashboardStore.getState().isFocusMode).toBe(false);
  });

  it("no modo de edição aparece o botão de remover do widget", async () => {
    renderDashboard();
    await userEvent.click(screen.getByTitle("Editar Layout"));
    expect((await screen.findAllByTitle("Remover Widget")).length).toBeGreaterThan(0);
  });

  it("nova aba cria um workspace", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("Estudos");
    renderDashboard();
    await userEvent.click(screen.getByTitle("Nova Aba"));
    expect(screen.getByText("Estudos")).toBeInTheDocument();
  });
});

describe("Sidebar", () => {
  const renderSidebar = () => render(<MemoryRouter><Sidebar /></MemoryRouter>);

  it("mostra o perfil e o menu padrão", () => {
    renderSidebar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Loja de Widgets")).toBeInTheDocument();
    expect(screen.getByTitle("Editar Perfil")).toBeInTheDocument();
  });

  it("Ajustes abre o painel de personalização", async () => {
    renderSidebar();
    await userEvent.click(screen.getByText("Ajustes"));
    expect(screen.getByText("Personalizar")).toBeInTheDocument();
    expect(screen.getByText("Cores do Sistema")).toBeInTheDocument();
    expect(screen.getByText("Transparência")).toBeInTheDocument();
  });

  it("clicar no perfil abre a edição", async () => {
    renderSidebar();
    await userEvent.click(screen.getByTitle("Editar Perfil"));
    expect(screen.getByText("Editar Perfil", { selector: "h3" })).toBeInTheDocument();
  });

  it("itens customizados substituem o menu padrão", () => {
    render(<MemoryRouter><Sidebar items={[{ label: "Só um", path: "/x" }]} /></MemoryRouter>);
    expect(screen.getByText("Só um")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
