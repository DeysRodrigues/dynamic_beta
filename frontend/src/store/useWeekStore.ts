import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WeekGroup {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  mainTag: string; // A "Tagzona" que representa este grupo
}

interface WeekState {
  weeks: WeekGroup[];
  activeWeekId: string | null;
  addWeek: (week: WeekGroup) => void;
  removeWeek: (id: string) => void;
  setActiveWeek: (id: string) => void;
}

export const useWeekStore = create<WeekState>()(
  persist(
    (set) => ({
      weeks: [],
      activeWeekId: null,

      addWeek: (week) => set((state) => ({ weeks: [...state.weeks, week] })),
      
      removeWeek: (id) =>
        set((state) => ({
          weeks: state.weeks.filter((w) => w.id !== id),
          activeWeekId: state.activeWeekId === id ? null : state.activeWeekId,
        })),

      setActiveWeek: (id) => set({ activeWeekId: id }),
    }),
    {
      name: "weeks-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);