import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layouts } from "react-grid-layout";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const defaultLayouts: Layouts = {
  lg: [
    // Coluna 1 (Esquerda)
    { i: "tasks", x: 0, y: 0, w: 1, h: 6 }, 
    // Coluna 2 (Meio-Esquerda)
    { i: "progress", x: 1, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 1, y: 2, w: 1, h: 4 },
    // Coluna 3 (Meio-Direita)
    { i: "tags", x: 2, y: 0, w: 1, h: 2 },
    { i: "metatags", x: 2, y: 2, w: 1, h: 4 },
    // Coluna 4 (Direita)
    { i: "embedded", x: 3, y: 0, w: 1, h: 6 },
    
    // Itens ocultos por padrão (movidos para fora da visão inicial ou removidos do defaultBoxes)
    { i: "hours", x: 0, y: 6, w: 1, h: 2 },
    { i: "tasksimport", x: 1, y: 6, w: 1, h: 2 },
  ],

  // Layouts responsivos (md e sm) ajustados para empilhar verticalmente de forma lógica
  md: [
    { i: "progress", x: 0, y: 0, w: 1, h: 2 },
    { i: "tags", x: 1, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 0, y: 2, w: 1, h: 4 },
    { i: "metatags", x: 1, y: 2, w: 1, h: 4 },
    { i: "tasks", x: 0, y: 6, w: 2, h: 4 },
    { i: "embedded", x: 0, y: 10, w: 2, h: 4 },
  ],
  sm: [
    { i: "progress", x: 0, y: 0, w: 1, h: 2 },
    { i: "tags", x: 0, y: 2, w: 1, h: 2 },
    { i: "pomodoro", x: 0, y: 4, w: 1, h: 4 },
    { i: "metatags", x: 0, y: 8, w: 1, h: 4 },
    { i: "tasks", x: 0, y: 12, w: 1, h: 4 },
    { i: "embedded", x: 0, y: 16, w: 1, h: 4 },
  ],
};
// Lista de boxes padrão atualizada para mostrar apenas os da imagem
const defaultBoxes = [
  "tasks",
  "progress",
  "pomodoro",
  "tags",
  "metatags",
  "embedded",

];

interface DashboardState {
  layouts: Layouts;
  boxes: string[];
  // Correção: Agora aceita Layouts OU uma função que recebe o anterior e retorna o novo
  setLayouts: (layouts: Layouts | ((prev: Layouts) => Layouts)) => void;
  setBoxes: (boxes: string[] | ((prev: string[]) => string[])) => void;
  resetDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layouts: defaultLayouts,
      boxes: defaultBoxes,

      // Correção: Lógica para verificar se é função ou valor
      setLayouts: (newLayoutsOrFn) => set((state) => {
        const newLayouts = typeof newLayoutsOrFn === 'function'
          ? (newLayoutsOrFn as (prev: Layouts) => Layouts)(state.layouts)
          : newLayoutsOrFn;
        return { layouts: newLayouts };
      }),

      setBoxes: (newBoxesOrFn) => set((state) => {
        const newBoxes = typeof newBoxesOrFn === 'function' 
          ? newBoxesOrFn(state.boxes) 
          : newBoxesOrFn;
        return { boxes: newBoxes };
      }),

      resetDashboard: () => set({ layouts: defaultLayouts, boxes: defaultBoxes }),
    }),
    { name: STORAGE_KEYS.DASHBOARD }
  )
);