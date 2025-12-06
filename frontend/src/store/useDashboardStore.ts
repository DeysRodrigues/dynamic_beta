import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layouts, Layout } from "react-grid-layout";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// Função auxiliar para gerar ID único
const generateId = (type: string) =>
  `${type}-${Math.random().toString(36).substr(2, 9)}`;

const defaultLayouts: Layouts = {
  lg: [
    { i: "tasks", x: 0, y: 0, w: 1, h: 6 },
    { i: "progress", x: 1, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 1, y: 2, w: 1, h: 4 },
    { i: "tags", x: 2, y: 0, w: 1, h: 2 },
    { i: "metatags", x: 2, y: 2, w: 1, h: 4 },
    { i: "embedded-default", x: 3, y: 0, w: 1, h: 6 },
    { i: "hours", x: 0, y: 6, w: 1, h: 2 },
    { i: "tasksimport", x: 1, y: 6, w: 1, h: 2 },
  ],
  md: [
    { i: "progress", x: 0, y: 0, w: 1, h: 2 },
    { i: "tags", x: 1, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 0, y: 2, w: 1, h: 4 },
    { i: "metatags", x: 1, y: 2, w: 1, h: 4 },
    { i: "tasks", x: 0, y: 6, w: 2, h: 4 },
    { i: "embedded-default", x: 0, y: 10, w: 2, h: 4 },
  ],
  sm: [
    { i: "progress", x: 0, y: 0, w: 1, h: 2 },
    { i: "tags", x: 0, y: 2, w: 1, h: 2 },
    { i: "pomodoro", x: 0, y: 4, w: 1, h: 4 },
    { i: "metatags", x: 0, y: 8, w: 1, h: 4 },
    { i: "tasks", x: 0, y: 12, w: 1, h: 4 },
    { i: "embedded-default", x: 0, y: 16, w: 1, h: 4 },
  ],
};

const defaultBoxes = [
  "tasks",
  "progress",
  "pomodoro",
  "tags",
  "metatags",
  "embedded-default",
];

interface DashboardState {
  layouts: Layouts;
  boxes: string[];
  setLayouts: (layouts: Layouts | ((prev: Layouts) => Layouts)) => void;
  setBoxes: (boxes: string[] | ((prev: string[]) => string[])) => void;
  addBox: (type: string) => void;
  loadDashboardState: (boxes: string[], layouts: Layouts) => void;
  resetDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layouts: defaultLayouts,
      boxes: defaultBoxes,

      setLayouts: (newLayoutsOrFn) =>
        set((state) => {
          const newLayouts =
            typeof newLayoutsOrFn === "function"
              ? (newLayoutsOrFn as (prev: Layouts) => Layouts)(state.layouts)
              : newLayoutsOrFn;
          return { layouts: newLayouts };
        }),

      setBoxes: (newBoxesOrFn) =>
        set((state) => {
          const newBoxes =
            typeof newBoxesOrFn === "function"
              ? newBoxesOrFn(state.boxes)
              : newBoxesOrFn;
          return { boxes: newBoxes };
        }),

      addBox: (type: string) => {
        const newId = generateId(type);
        set((state) => {
          let defaultH = 4;
          if (type === "embedded") defaultH = 6;
          if (type === "notepad") defaultH = 4;
          if (type === "habit") defaultH = 3;
          if (type === "calendar") defaultH = 5;
          if (type === "garden") defaultH = 4;
          if (type === "theme") defaultH = 2;
          if (type === "rpg") defaultH = 3;
          if (type === "books") defaultH = 3;
          if (type === "goals") defaultH = 4;
          if (type === "auto") defaultH = 3;
          if (type === "workout") defaultH = 3;
          if (type === "sleep") defaultH = 3;
          if (type === 'library') defaultH = 3;

          const newItem: Layout = {
            i: newId,
            x: 0,
            y: Infinity,
            w: 1,
            h: defaultH,
          };

          return {
            boxes: [...state.boxes, newId],
            layouts: {
              ...state.layouts,
              lg: [...(state.layouts.lg || []), newItem],
              md: [...(state.layouts.md || []), newItem],
              sm: [...(state.layouts.sm || []), newItem],
            },
          };
        });
      },

      loadDashboardState: (boxes, layouts) => set({ boxes, layouts }),

      resetDashboard: () =>
        set({ layouts: defaultLayouts, boxes: defaultBoxes }),
    }),
    { name: STORAGE_KEYS.DASHBOARD }
  )
);