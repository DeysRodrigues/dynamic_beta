import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistConfig, PERSISTED } from "@/persistence/registry";

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
  syncTime: () => void; // Recomputes the time
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
          // PAUSE: clears the target, keeps the current timeLeft
          set({ isRunning: false, endTime: null });
        } else {
          // START: sets the target (now + time left)
          // This keeps the time running even in another tab
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

      // Called every second by the manager
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
      ...persistConfig(PERSISTED.pomodoro),
      // While the timer runs, `timeLeft` changes every second but can always be worked out from
      // `endTime`, so it is not saved then. Saving it would write to storage (and, signed in, send
      // to the server) once a second for as long as the timer runs.
      partialize: (state) => ({
        mode: state.mode,
        isRunning: state.isRunning,
        endTime: state.endTime,
        counts: state.counts,
        ...(state.isRunning ? {} : { timeLeft: state.timeLeft }),
      }),
      // A timer that was running when the page closed picks up the right time at once.
      onRehydrateStorage: () => (state) => state?.syncTime(),
    }
  )
);