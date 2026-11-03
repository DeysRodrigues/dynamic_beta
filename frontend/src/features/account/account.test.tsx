import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AccountPage from "@/pages/AccountPage";
import ConflictDialog from "./ConflictDialog";
import { AccountSummary } from "./AccountSummary";
import { timeAgo } from "./timeAgo";
import { useConflictUi } from "./conflictUi";
import { disconnect, connect } from "@/sync/connection";
import { createFakeServer, type FakeServer } from "@/sync/fakeServer";
import { useSession } from "@/sync/session";
import { useSync } from "@/sync/status";
import { useTagStore } from "@/store/useTagStore";
import { useUserStore } from "@/store/useUserStore";
import { useDashboardStore } from "@/store/useDashboardStore";

let server: FakeServer;
const realLocation = window.location;

const renderPage = () =>
  render(
    <MemoryRouter>
      <ConflictDialog />
      <AccountPage />
    </MemoryRouter>
  );

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, email = "ana@example.com", password = "uma-senha-longa") {
  await user.type(screen.getByLabelText("Endereço do servidor"), "http://server.test");
  await user.type(screen.getByLabelText("E-mail"), email);
  await user.type(screen.getByLabelText("Senha"), password);
}

beforeEach(() => {
  server = createFakeServer();
  vi.stubGlobal("fetch", server.fetchFn);
  useConflictUi.setState({ dismissedFor: null });
  useTagStore.setState({ tags: [] });
});

afterEach(() => {
  disconnect("user");
  useSync.setState({ problem: null });
  vi.unstubAllGlobals();
  Object.defineProperty(window, "location", { configurable: true, value: realLocation });
});

describe("modo local", () => {
  it("diz que os dados ficam só neste navegador e oferece conectar a um servidor", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Só neste navegador" })).toBeInTheDocument();
    expect(screen.getByText(/Não precisa de conta e funciona sem internet/)).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço do servidor")).toBeInTheDocument();
  });

  it("é só a conta: não traz o passo a passo do servidor, e linka para a Wiki", () => {
    renderPage();
    expect(screen.queryByText("Instale o Docker")).not.toBeInTheDocument();
    expect(screen.queryByText(/docker compose up/)).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Quero ter o meu" })).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Ainda não tem um servidor/ });
    expect(link).toHaveAttribute("href", "/wiki?secao=server");
  });

  it("não faz nenhum pedido enquanto ninguém conecta", () => {
    renderPage();
    expect(server.state.requests).toHaveLength(0);
  });
});

describe("testar a conexão", () => {
  it("encontra um servidor DynaBox", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://server.test");
    await user.click(screen.getByRole("button", { name: "Testar conexão" }));
    expect(await screen.findByText(/Servidor DynaBox encontrado em http:\/\/server\.test\./)).toBeInTheDocument();
  });

  it("o endereço do app (http://localhost:8080) funciona: acha o /api e passa a usar esse endereço", async () => {
    vi.stubGlobal("fetch", createFakeServer({ onlyUnder: "/api", rootBlocked: true }).fetchFn);
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://server.test");
    await user.click(screen.getByRole("button", { name: "Testar conexão" }));

    expect(await screen.findByText(/Servidor DynaBox encontrado em http:\/\/server\.test\/api/)).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço do servidor")).toHaveValue("http://server.test/api");
  });

  it("entrar com o endereço do app, sem /api, conecta", async () => {
    vi.stubGlobal("fetch", createFakeServer({ onlyUnder: "/api" }).fetchFn);
    const user = userEvent.setup();
    renderPage();
    await fillAndSubmit(user);
    await user.click(screen.getByRole("tab", { name: "Criar conta" }));
    await user.click(screen.getByRole("button", { name: /Criar conta e sincronizar/ }));
    expect(await screen.findByText("Conectado como")).toBeInTheDocument();
    expect(screen.getByText(/Servidor: http:\/\/server\.test\/api/)).toBeInTheDocument();
  });

  it("explica que o /api é achado sozinho", () => {
    renderPage();
    expect(screen.getByText(/O \/api eu acho sozinho/)).toBeInTheDocument();
  });

  it("avisa quando o servidor não aceita novas contas, e desliga o 'Criar conta'", async () => {
    server.state.registration = false;
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://server.test");
    await user.click(screen.getByRole("button", { name: "Testar conexão" }));

    expect(await screen.findByText(/não aceita novas contas/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Criar conta" })).toBeDisabled();
  });

  it("servidor fora do ar: explica em português", async () => {
    server.state.down = true;
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://server.test");
    await user.click(screen.getByRole("button", { name: "Testar conexão" }));
    expect(await screen.findByText(/Não consegui falar com o servidor/)).toBeInTheDocument();
  });

  it("um endereço que responde mas não é DynaBox", async () => {
    vi.stubGlobal("fetch", async () => new Response("<html>oi</html>", { status: 200 }));
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://qualquer.test");
    await user.click(screen.getByRole("button", { name: "Testar conexão" }));
    expect(await screen.findByText(/não parece ser um servidor DynaBox/)).toBeInTheDocument();
  });

  it("o botão fica desligado enquanto não há endereço", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Testar conexão" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Entrar e sincronizar/ })).toBeDisabled();
  });

  it("site https com servidor http remoto: avisa antes de tentar e não deixa enviar", async () => {
    Object.defineProperty(window, "location", { configurable: true, value: { ...realLocation, protocol: "https:", origin: "https://dynabox.space" } });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://meuservidor.com");

    expect(screen.getByRole("alert")).toHaveTextContent(/HTTPS/);
    expect(screen.getByRole("button", { name: "Testar conexão" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Entrar e sincronizar/ })).toBeDisabled();
    expect(server.state.requests).toHaveLength(0);
  });

  it("site https com http://localhost é permitido", async () => {
    Object.defineProperty(window, "location", { configurable: true, value: { ...realLocation, protocol: "https:", origin: "https://dynabox.space" } });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Endereço do servidor"), "http://localhost:8080/api");
    expect(screen.getByRole("button", { name: "Testar conexão" })).toBeEnabled();
  });
});

describe("entrar e criar conta", () => {
  it("criar conta conecta e mostra o painel com o e-mail e o servidor", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: "Criar conta" }));
    await fillAndSubmit(user);
    await user.click(screen.getByRole("button", { name: /Criar conta e sincronizar/ }));

    expect(await screen.findByText("Conectado como")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Servidor: http:\/\/server\.test/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Sincronizado/));
    expect(useSession.getState().token).not.toBeNull();
  });

  it("entrar numa conta que existe", async () => {
    server.addUser("ana@example.com", "uma-senha-longa");
    const user = userEvent.setup();
    renderPage();
    await fillAndSubmit(user);
    await user.click(screen.getByRole("button", { name: /Entrar e sincronizar/ }));
    expect(await screen.findByText("Conectado como")).toBeInTheDocument();
  });

  it.each([
    ["senha errada", "errada-errada", /E-mail ou senha incorretos/],
  ])("%s mostra o erro em português e continua no formulário", async (_n, password, message) => {
    server.addUser("ana@example.com", "uma-senha-longa");
    const user = userEvent.setup();
    renderPage();
    await fillAndSubmit(user, "ana@example.com", password);
    await user.click(screen.getByRole("button", { name: /Entrar e sincronizar/ }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByText("Conectado como")).not.toBeInTheDocument();
    expect(useSession.getState().token).toBeNull();
  });

  it("e-mail já usado ao criar conta", async () => {
    server.addUser("ana@example.com", "uma-senha-longa");
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: "Criar conta" }));
    await fillAndSubmit(user);
    await user.click(screen.getByRole("button", { name: /Criar conta e sincronizar/ }));
    expect(await screen.findByText(/Já existe uma conta com esse e-mail/)).toBeInTheDocument();
  });

  it("criar conta lembra o mínimo de 8 caracteres", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("tab", { name: "Criar conta" }));
    expect(screen.getByText(/pelo menos 8 caracteres/)).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toHaveAttribute("minlength", "8");
  });
});

describe("conectado", () => {
  async function connected() {
    await connect({ serverUrl: "http://server.test", mode: "register", email: "ana@example.com", password: "uma-senha-longa" });
    return renderPage();
  }

  it("mostra o que já está no servidor, com nome amigável, versão e há quanto tempo", async () => {
    localStorage.clear(); // nada guardado ainda: a conta nova começa vazia
    await connected();
    expect(screen.getByText(/Ainda nada foi enviado/)).toBeInTheDocument();

    useUserStore.getState().setName("Deys");
    useTagStore.getState().addTag("faculdade");
    const list = await screen.findByRole("region", { name: "O que já está no servidor" }, { timeout: 4000 });
    await waitFor(() => expect(within(list).getByText("Perfil")).toBeInTheDocument(), { timeout: 4000 });
    expect(within(list).getByText("Tags")).toBeInTheDocument();
    expect(within(list).getAllByText(/versão 1 · agora há pouco/).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/Ainda nada foi enviado/)).not.toBeInTheDocument();
  });

  it("sem conexão, diz quantos itens estão aguardando envio", async () => {
    await connected();
    server.state.down = true;
    useUserStore.getState().setName("Offline");
    expect(await screen.findByText(/1 item mudou aqui e está aguardando envio/)).toBeInTheDocument();
  });

  it("'Sincronizar agora' faz uma rodada com o servidor", async () => {
    const user = userEvent.setup();
    await connected();
    const gets = () => server.state.requests.filter((r) => r.method === "GET" && r.path === "/sync").length;
    const before = gets();
    await user.click(screen.getByRole("button", { name: /Sincronizar agora/ }));
    await waitFor(() => expect(gets()).toBeGreaterThan(before));
  });

  it("'Sair' volta ao modo local sem apagar nada", async () => {
    const user = userEvent.setup();
    useTagStore.getState().addTag("fica");
    await connected();
    await user.click(screen.getByRole("button", { name: /Sair/ }));

    expect(await screen.findByRole("heading", { name: "Só neste navegador" })).toBeInTheDocument();
    expect(useSession.getState().token).toBeNull();
    expect(JSON.parse(localStorage.getItem("tags-storage")!).state.tags).toContain("fica");
  });

  it("'Apagar dados da conta' pede confirmação, limpa o servidor e avisa na volta", async () => {
    const user = userEvent.setup();
    useTagStore.getState().addTag("vai pro servidor");
    await connected();
    await waitFor(() => expect(server.docs("user-1").size).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: /Apagar dados da conta/ }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Apagar os dados da conta?");
    expect(server.docs("user-1").size).toBeGreaterThan(0); // ainda não apagou

    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Apagar do servidor" }));
    expect(await screen.findByText(/Os dados da conta foram apagados do servidor/)).toBeInTheDocument();
    expect(server.docs("user-1").size).toBe(0);
    expect(JSON.parse(localStorage.getItem("tags-storage")!).state.tags).toContain("vai pro servidor");
  });

  it("'Restaurar widgets' volta o painel ao padrão sem mexer nos outros dados nem na conta", async () => {
    const user = userEvent.setup();
    useTagStore.getState().addTag("continua");
    useDashboardStore.getState().addBox("water");
    await connected();
    const boxes = () => useDashboardStore.getState().workspaces.find((w) => w.id === useDashboardStore.getState().activeWorkspaceId)!.boxes;
    expect(boxes().length).toBeGreaterThan(4);

    await user.click(screen.getByRole("button", { name: /Restaurar widgets/ }));
    expect(boxes().length).toBeGreaterThan(4); // só depois de confirmar
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Restaurar" }));

    expect(boxes().map((b) => b.type)).toEqual(["tasks", "progress", "pomodoro", "tags"]);
    expect(useTagStore.getState().tags).toContain("continua");
    expect(screen.getByText("Conectado como")).toBeInTheDocument();
    expect(useSession.getState().token).not.toBeNull();
  });

  it("avisa que o login dura 14 dias", async () => {
    await connected();
    expect(screen.getByRole("note")).toHaveTextContent("O login dura 14 dias");
  });

  it("cancelar a confirmação não apaga nada", async () => {
    const user = userEvent.setup();
    useTagStore.getState().addTag("x");
    await connected();
    await waitFor(() => expect(server.docs("user-1").size).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: /Apagar dados da conta/ }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));
    expect(server.docs("user-1").size).toBeGreaterThan(0);
    expect(screen.getByText("Conectado como")).toBeInTheDocument();
  });

  it("sessão que o servidor recusa: volta ao modo local e explica que expirou", async () => {
    const user = userEvent.setup();
    await connected();
    server.state.revokedTokens.add(useSession.getState().token!);
    await user.click(screen.getByRole("button", { name: /Sincronizar agora/ }));

    expect(await screen.findByText(/Sua sessão expirou/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Só neste navegador" })).toBeInTheDocument();
  });

  it("sem conexão: o status diz e o app segue", async () => {
    const user = userEvent.setup();
    await connected();
    server.state.down = true;
    await user.click(screen.getByRole("button", { name: /Sincronizar agora/ }));
    expect(await screen.findByText(/Sem conexão/)).toBeInTheDocument();
    expect(screen.getByText("Conectado como")).toBeInTheDocument();
  });
});

describe("diálogo de conflito", () => {
  async function withConflict() {
    localStorage.setItem("tags-storage", JSON.stringify({ state: { tags: ["daqui"] }, version: 1 }));
    const id = server.addUser("ana@example.com", "uma-senha-longa");
    server.seed(id, "tags-storage", { state: { tags: ["de lá"] }, version: 1 }, 1, 4);
    const view = renderPage();
    await connect({ serverUrl: "http://server.test", mode: "login", email: "ana@example.com", password: "uma-senha-longa" });
    return view;
  }

  it("aparece com o nome da chave, e nada foi sobrescrito", async () => {
    await withConflict();
    const dialog = await screen.findByRole("dialog", { name: "Conflito de sincronização" });
    expect(dialog).toHaveTextContent("Seus dados mudaram nos dois lugares");
    expect(dialog).toHaveTextContent("Tags");
    expect(JSON.parse(localStorage.getItem("tags-storage")!).state.tags).toEqual(["daqui"]);
    expect(server.docs("user-1").get("tags-storage")?.revision).toBe(4);
  });

  it("'Usar a do servidor' troca o local e fecha", async () => {
    const user = userEvent.setup();
    await withConflict();
    await user.click(await screen.findByRole("button", { name: "Usar a do servidor" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(useTagStore.getState().tags).toEqual(["de lá"]);
  });

  it("'Manter a daqui' envia a versão local por cima", async () => {
    const user = userEvent.setup();
    await withConflict();
    await user.click(await screen.findByRole("button", { name: "Manter a daqui" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(server.docs("user-1").get("tags-storage")?.payload).toEqual({ state: { tags: ["daqui"] }, version: 1 }));
  });

  it("'Decidir depois' fecha, o status continua em conflito, e dá para reabrir", async () => {
    const user = userEvent.setup();
    await withConflict();
    await user.click(await screen.findByRole("button", { name: "Decidir depois" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useSync.getState().status).toBe("conflict");

    await user.click(screen.getByRole("button", { name: /Resolver 1 conflito/ }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("não aparece quando não há conflito", async () => {
    renderPage();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("resumo nos Ajustes", () => {
  it("no modo local oferece conectar e leva à página de conta", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(<MemoryRouter><AccountSummary onNavigate={onNavigate} /></MemoryRouter>);

    expect(screen.getByText("Só neste navegador", { selector: "p" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Conectar a um servidor" }));
    expect(onNavigate).toHaveBeenCalled();
  });

  it("conectado mostra o e-mail", async () => {
    await connect({ serverUrl: "http://server.test", mode: "register", email: "ana@example.com", password: "uma-senha-longa" });
    render(<MemoryRouter><AccountSummary onNavigate={() => {}} /></MemoryRouter>);
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gerenciar conta" })).toBeInTheDocument();
  });
});

describe("timeAgo", () => {
  const now = 1_000_000_000_000;
  it.each([
    [now - 10_000, "agora há pouco"],
    [now - 5 * 60_000, "há 5 min"],
    [now - 3 * 3_600_000, "há 3 h"],
    [now - 24 * 3_600_000, "há 1 dia"],
    [now - 72 * 3_600_000, "há 3 dias"],
    [now + 5000, "agora há pouco"],
  ])("%i -> %s", (timestamp, text) => expect(timeAgo(timestamp, now)).toBe(text));
});
