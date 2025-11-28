import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/storageKeys";

export interface Goal {
  tag: string;
  hours: number;
}

interface GoalState {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  removeGoal: (index: number) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) => {
        if (goal.tag && goal.hours > 0) {
          set((state) => ({ goals: [...state.goals, goal] }));
        }
      },
      removeGoal: (index) =>
        set((state) => ({ goals: state.goals.filter((_, i) => i !== index) })),
    }),
    { name: STORAGE_KEYS.GOALS }
  )
);