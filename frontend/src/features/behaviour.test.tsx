import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SettingsDrawer } from "./sidebar/SettingsDrawer";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ActionModal from "@/components/ui/ActionModal";
import PomodoroManager from "@/components/layout/PomodoroManager";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { PERSISTED } from "@/persistence/registry";

describe("reset", () => {
  const reload = vi.fn();
  beforeEach(() => {
    reload.mockClear();
    Object.defineProperty(window, "location", { configurable: true, value: { ...window.location, reload } });
  });

  it("pede confirmação dentro do app, sem usar window.confirm", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    localStorage.setItem(PERSISTED.tasks.key, "{}");
    render(<MemoryRouter><SettingsDrawer onClose={() => {}} /></MemoryRouter>);

    await userEvent.click(screen.getByText("Reset"));
    expect(screen.getByText("Resetar tudo?")).toBeInTheDocument();
    expect(localStorage.getItem(PERSISTED.tasks.key)).not.toBeNull();
    expect(confirmSpy).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText("Resetar"));
    expect(localStorage.getItem(PERSISTED.tasks.key)).toBeNull();
    expect(reload).toHaveBeenCalled();
  });

  it("cancelar não apaga nada", async () => {
    localStorage.setItem(PERSISTED.tasks.key, "{}");
    render(<MemoryRouter><SettingsDrawer onClose={() => {}} /></MemoryRouter>);
    await userEvent.click(screen.getByText("Reset"));
    await userEvent.click(screen.getByText("Cancelar"));
    expect(localStorage.getItem(PERSISTED.tasks.key)).not.toBeNull();
    expect(screen.queryByText("Resetar tudo?")).not.toBeInTheDocument();
  });
});

describe("modais", () => {
  it("ConfirmModal chama onConfirm e onCancel, e não renderiza fechado", async () => {
    const onConfirm = vi.fn(), onCancel = vi.fn();
    const { rerender } = render(<ConfirmModal isOpen={false} title="T" message="M" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.queryByText("T")).not.toBeInTheDocument();
    rerender(<ConfirmModal isOpen title="T" message="M" confirmLabel="Sim" onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByText("Sim"));
    await userEvent.click(screen.getByText("Cancelar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("os modais saem direto no body, fora do elemento onde são usados", () => {
    const { container } = render(<div id="cell" style={{ transform: "translate(0,0)" }}><ActionModal isOpen title="Aviso" message="oi" onClose={() => {}} /></div>);
    expect(container.querySelector("#cell")!.textContent).toBe("");
    expect(screen.getByText("Aviso").closest("body")).toBe(document.body);
  });
});

describe("PomodoroManager", () => {
  beforeEach(() => {
    class FakeNotification { static permission = "denied"; }
    class FakeAudio { volume = 1; play() { return Promise.resolve(); } }
    vi.stubGlobal("Notification", FakeNotification);
    vi.stubGlobal("Audio", FakeAudio);
    usePomodoroStore.setState({ mode: "work", timeLeft: 100, isRunning: false, endTime: null, counts: { work: 0, short: 0, long: 0 } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("ao chegar a zero conta uma vez e passa para a pausa", () => {
    render(<PomodoroManager />);
    act(() => usePomodoroStore.setState({ timeLeft: 0, isRunning: false }));

    const s = usePomodoroStore.getState();
    expect(s.counts.work).toBe(1);
    expect(s.mode).toBe("short");
    expect(s.timeLeft).toBe(5 * 60);
  });

  it("não conta de novo enquanto o tempo segue parado em zero", () => {
    render(<PomodoroManager />);
    act(() => usePomodoroStore.setState({ timeLeft: 0, isRunning: false }));
    act(() => usePomodoroStore.setState({ counts: { ...usePomodoroStore.getState().counts } }));
    expect(usePomodoroStore.getState().counts.work).toBe(1);
  });

  it("depois da pausa, o próximo zero conta de novo", () => {
    render(<PomodoroManager />);
    act(() => usePomodoroStore.setState({ timeLeft: 0, isRunning: false }));
    act(() => usePomodoroStore.setState({ timeLeft: 0, isRunning: false }));
    const s = usePomodoroStore.getState();
    expect(s.counts.short).toBe(1);
    expect(s.mode).toBe("work");
  });
});
