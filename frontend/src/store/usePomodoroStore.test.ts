import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { usePomodoroStore } from "./usePomodoroStore";

const saved = () => JSON.parse(localStorage.getItem("pomodoro-global-storage")!);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  usePomodoroStore.setState({ mode: "work", timeLeft: 1500, isRunning: false, endTime: null, counts: { work: 0, short: 0, long: 0 } });
});
afterEach(() => vi.useRealTimers());

describe("o que o pomodoro grava", () => {
  it("rodando, o que é gravado não muda a cada segundo (senão gravaria e enviaria sem parar)", () => {
    usePomodoroStore.getState().toggleTimer();
    const first = localStorage.getItem("pomodoro-global-storage");

    for (let i = 0; i < 30; i++) {
      vi.advanceTimersByTime(1000);
      usePomodoroStore.getState().syncTime();
    }

    expect(usePomodoroStore.getState().timeLeft).toBe(1500 - 30);
    expect(localStorage.getItem("pomodoro-global-storage")).toBe(first);
  });

  it("rodando, grava o fim previsto e não o tempo restante", () => {
    usePomodoroStore.getState().toggleTimer();
    const { state } = saved();
    expect(state.isRunning).toBe(true);
    expect(state.endTime).toBe(Date.now() + 1500 * 1000);
    expect("timeLeft" in state).toBe(false);
  });

  it("pausado, grava o tempo restante", () => {
    usePomodoroStore.getState().toggleTimer();
    vi.advanceTimersByTime(60_000);
    usePomodoroStore.getState().syncTime();
    usePomodoroStore.getState().toggleTimer();

    const { state } = saved();
    expect(state.isRunning).toBe(false);
    expect(state.timeLeft).toBe(1440);
  });

  it("mudar o modo e contar uma sessão continuam sendo gravados", () => {
    usePomodoroStore.getState().setMode("short");
    expect(saved().state).toMatchObject({ mode: "short", timeLeft: 300 });
    usePomodoroStore.getState().addCount("work");
    expect(saved().state.counts.work).toBe(1);
  });

  it("um timer que estava rodando quando a página fechou volta com o tempo certo, na hora", async () => {
    usePomodoroStore.getState().toggleTimer();
    vi.advanceTimersByTime(90_000); // a página ficou fechada 1,5 min

    usePomodoroStore.setState({ timeLeft: 1500, isRunning: false, endTime: null }); // memória zerada pelo reload
    localStorage.setItem("pomodoro-global-storage", JSON.stringify({ version: 1, state: { mode: "work", isRunning: true, endTime: Date.now() + 1410_000, counts: { work: 0, short: 0, long: 0 } } }));
    await usePomodoroStore.persist.rehydrate();

    expect(usePomodoroStore.getState().isRunning).toBe(true);
    expect(usePomodoroStore.getState().timeLeft).toBe(1410);
  });

  it("dado salvo antes dessa mudança (com timeLeft e rodando) ainda é lido", async () => {
    localStorage.setItem("pomodoro-global-storage", JSON.stringify({ version: 1, state: { mode: "long", timeLeft: 123, isRunning: false, endTime: null, counts: { work: 2, short: 0, long: 0 } } }));
    await usePomodoroStore.persist.rehydrate();
    expect(usePomodoroStore.getState()).toMatchObject({ mode: "long", timeLeft: 123, counts: { work: 2 } });
  });
});
