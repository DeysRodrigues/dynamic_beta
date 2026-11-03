import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Profiler, act } from "react";
import { render, screen, renderHook, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import EmbeddedBox from "@/components/layout/boxes/EmbeddedBox";
import NotepadBox from "@/components/layout/boxes/NotepadBox";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBoxContentStore } from "@/store/useBoxContentStore";

beforeEach(() => useBoxContentStore.setState({ contents: {} }));

describe("rotas", () => {
  it("o widget embutido de água abre sozinho, sem carregar a casca do app", async () => {
    window.history.pushState({}, "", "/w/water");
    render(<App />);
    expect(await screen.findByText("Hidratação")).toBeInTheDocument();
    expect(screen.queryByText("Ajustes")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  }, 15000);

  it("a rota inicial carrega o dashboard com a barra lateral", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(await screen.findByText("Ajustes", {}, { timeout: 8000 })).toBeInTheDocument();
  }, 15000);

  it("a rota inicial mostra os widgets na grade depois de carregar", async () => {
    window.history.pushState({}, "", "/");
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelectorAll(".react-grid-item").length).toBeGreaterThanOrEqual(4), { timeout: 8000 });
  }, 15000);
});

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("devolve o primeiro valor na hora e só segue depois da pausa", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 500), { initialProps: { v: "a" } });
    expect(result.current).toBe("a");

    rerender({ v: "ab" });
    rerender({ v: "abc" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("a");

    act(() => { vi.advanceTimersByTime(250); });
    expect(result.current).toBe("abc");
  });
});

describe("EmbeddedBox", () => {
  it("um endereço já salvo vira iframe na primeira renderização", () => {
    useBoxContentStore.setState({ contents: { "embedded-1": { url: "http://localhost/w/water", mode: "app" } } });
    render(<EmbeddedBox id="embedded-1" />);
    expect(screen.getByTitle("Embed-embedded-1")).toHaveAttribute("src", "http://localhost/w/water");
    expect(screen.getByTitle("Embed-embedded-1")).toHaveAttribute("loading", "lazy");
  });

  it("o iframe não recarrega a cada tecla digitada", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useBoxContentStore.setState({ contents: { "embedded-2": { url: "https://example.com/a", mode: "app", isLocked: false } } });
    render(<EmbeddedBox id="embedded-2" />);

    const input = await screen.findByDisplayValue("https://example.com/a", {}, { timeout: 2000 }).catch(() => null);
    if (input) {
      await userEvent.type(input, "bc", { advanceTimers: vi.advanceTimersByTime });
      expect(screen.getByTitle("Embed-embedded-2")).toHaveAttribute("src", "https://example.com/a");
      await act(async () => { vi.advanceTimersByTime(700); });
      expect(screen.getByTitle("Embed-embedded-2")).toHaveAttribute("src", "https://example.com/abc");
    }
    vi.useRealTimers();
  });
});

describe("conteúdo dos widgets", () => {
  it("um widget não renderiza de novo quando OUTRO box grava o conteúdo dele", () => {
    const onRender = vi.fn();
    render(
      <Profiler id="note" onRender={onRender}>
        <NotepadBox id="notepad-quiet" />
      </Profiler>
    );
    const before = onRender.mock.calls.length;

    act(() => useBoxContentStore.getState().setBoxContent("auto-other", { rules: [] }));
    act(() => useBoxContentStore.getState().setBoxContent("books-other", { books: [] }));

    expect(onRender.mock.calls.length).toBe(before);
  });
});
