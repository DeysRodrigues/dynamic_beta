import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Layouts, Layout } from "react-grid-layout";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// --- 1. CONFIGURAÇÃO (CONSTANTES) ---

// Mapa de Alturas (Evita aquele monte de "if/else")
const WIDGET_HEIGHTS: Record<string, number> = {
  embedded: 3,
  calendar: 3,
  tasks: 3,
  pomodoro: 3,
  notepad: 4,
  goals: 4,
  garden: 4,
  habit: 3,
  rpg: 3,
  books: 3,
  auto: 3,
  workout: 3,
  sleep: 3,
  library: 3,
  theme: 2,
  snippet: 3,
  quicklinks: 3,
  risk: 4,
  presence: 4,
  // fallback
  default: 3,
};

const DEFAULT_BOXES = ["tasks", "progress", "pomodoro", "tags"];

const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: "tasks", x: 0, y: 0, w: 1, h: 6 },
    { i: "progress", x: 1, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 1, y: 2, w: 1, h: 4 },
    { i: "tags", x: 2, y: 0, w: 1, h: 2 },
  ],
  md: [
    { i: "tasks", x: 0, y: 0, w: 1, h: 8 },
    { i: "progress", x: 1, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 1, y: 2, w: 1, h: 5 },
    { i: "tags", x: 1, y: 7, w: 1, h: 3 },
  ],
  sm: [
    { i: "progress", x: 0, y: 0, w: 1, h: 2 },
    { i: "pomodoro", x: 0, y: 2, w: 1, h: 5 },
    { i: "tasks", x: 0, y: 7, w: 1, h: 6 },
    { i: "tags", x: 0, y: 13, w: 1, h: 3 },
  ],
};

const generateId = (type: string) =>
  `${type}-${Math.random().toString(36).substr(2, 9)}`;

// Definição das Colunas por Breakpoint (Deve bater com o Home.tsx)
const COLS = { lg: 4, md: 2, sm: 1 };

// --- 2. TYPES ---

interface DashboardState {
  // Slice de Dados
  layouts: Layouts;
  boxes: string[];
}

interface DashboardActions {
  // Slice de Ações
  setLayouts: (layouts: Layouts) => void;
  addBox: (type: string) => void;
  removeBox: (id: string) => void; // Agora é atômica e vive no store!
  resetDashboard: () => void;
  loadDashboardState: (boxes: string[], layouts: Layouts) => void;
}

// --- 3. STORE OTIMIZADA ---

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  subscribeWithSelector(
    // 1. Permite assinaturas granulares
    immer(
      // 2. Permite mutações diretas (draft)
      persist(
        (set) => ({
          // Estado Inicial
          layouts: DEFAULT_LAYOUTS,
          boxes: DEFAULT_BOXES,

          // Ações
          setLayouts: (newLayouts) =>
            set((state) => {
              state.layouts = newLayouts; // Mutação direta graças ao Immer
            }),

          addBox: (type) =>
            set((state) => {
              const newId = generateId(type);
              const height = WIDGET_HEIGHTS[type] || WIDGET_HEIGHTS.default;

              // Adiciona na lista de IDs
              state.boxes.push(newId);

              // Adiciona no Layout (Calculando a melhor posição X)
              (["lg", "md", "sm"] as const).forEach((bp) => {
                if (!state.layouts[bp]) state.layouts[bp] = [];

                const currentLayout = state.layouts[bp];
                const numCols = COLS[bp];

                // 1. Calcula a altura ocupada (Y max) de cada coluna
                const colY = new Array(numCols).fill(0);

                currentLayout.forEach((item) => {
                  const itemX = item.x || 0;
                  const itemW = item.w || 1;
                  const itemY = item.y || 0;
                  const itemH = item.h || 1;
                  const bottom = itemY + itemH;

                  // Atualiza a altura de todas as colunas que esse widget ocupa
                  for (let i = itemX; i < itemX + itemW && i < numCols; i++) {
                    if (bottom > colY[i]) {
                      colY[i] = bottom;
                    }
                  }
                });

                // 2. Encontra a coluna mais "curta" (menor Y)
                let targetX = 0;
                let minY = Infinity;

                for (let i = 0; i < numCols; i++) {
                  if (colY[i] < minY) {
                    minY = colY[i];
                    targetX = i;
                  }
                }

                // 3. Cria o widget nessa coluna
                const newLayoutItem: Layout = {
                  i: newId,
                  x: targetX,
                  y: Infinity, // Vai para o final da coluna escolhida
                  w: 1,
                  h: height,
                };

                state.layouts[bp].push(newLayoutItem);
              });
            }),

          removeBox: (id) =>
            set((state) => {
              // Remove ID
              state.boxes = state.boxes.filter((boxId) => boxId !== id);

              // Remove do Layout (em todos os breakpoints)
              Object.keys(state.layouts).forEach((bp) => {
                state.layouts[bp] = state.layouts[bp].filter((l) => l.i !== id);
              });
            }),

          resetDashboard: () =>
            set((state) => {
              state.layouts = DEFAULT_LAYOUTS;
              state.boxes = DEFAULT_BOXES;
            }),

          loadDashboardState: (boxes, layouts) =>
            set((state) => {
              state.boxes = boxes;
              state.layouts = layouts;
            }),
        }),
        {
          name: STORAGE_KEYS.DASHBOARD,
          // 3. Partialize: Salva apenas o estado, ignora ações
          partialize: (state) => ({
            layouts: state.layouts,
            boxes: state.boxes,
          }),
        }
      )
    )
  )
);
