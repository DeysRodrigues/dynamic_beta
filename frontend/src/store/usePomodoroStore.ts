import { create } from "zustand";
import { persist } from "zustand/middleware";

type Mode = "work" | "short" | "long";

interface PomodoroState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  endTime: number | null;
  counts: { work: number; short: number; long: number };

  setMode: (mode: Mode) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  addCount: (mode: Mode) => void;
  syncTime: () => void; // Função que recalcula o tempo
}

const TIMES = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: "work",
      timeLeft: TIMES.work,
      isRunning: false,
      endTime: null,
      counts: { work: 0, short: 0, long: 0 },

      setMode: (mode) => {
        set({ 
          mode, 
          timeLeft: TIMES[mode], 
          isRunning: false, 
          endTime: null 
        });
      },

      toggleTimer: () => {
        const { isRunning, timeLeft } = get();
        
        if (isRunning) {
          // PAUSAR: Limpa o alvo, mantém o timeLeft atual
          set({ isRunning: false, endTime: null });
        } else {
          // INICIAR: Define o alvo (Agora + Tempo Restante)
          // Isso garante que o tempo corra mesmo em outra aba
          const target = Date.now() + (timeLeft * 1000);
          set({ isRunning: true, endTime: target });
        }
      },

      resetTimer: () => {
        const { mode } = get();
        set({ 
          timeLeft: TIMES[mode], 
          isRunning: false, 
          endTime: null 
        });
      },

      addCount: (completedMode) => {
        set((state) => ({
          counts: {
            ...state.counts,
            [completedMode]: state.counts[completedMode] + 1
          }
        }));
      },

      // Chamado a cada segundo pelo Manager
      syncTime: () => {
        const { isRunning, endTime } = get();
        
        if (isRunning && endTime) {
          const now = Date.now();
          const diff = Math.ceil((endTime - now) / 1000);
          
          if (diff <= 0) {
            // Tempo acabou! (O Manager vai tocar o som)
            set({ timeLeft: 0, isRunning: false, endTime: null });
          } else {
            set({ timeLeft: diff });
          }
        }
      }
    }),
    {
      name: "pomodoro-global-storage", // Nome novo para não conflitar com o antigo
    }
  )
);