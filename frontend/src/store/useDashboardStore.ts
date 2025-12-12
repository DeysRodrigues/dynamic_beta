import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Layouts } from "react-grid-layout";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// --- CONFIGURAÇÃO ---

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
  activity: 4,
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

const COLS = { lg: 4, md: 2, sm: 1 };

// --- TYPES ---

export interface Workspace {
  id: string;
  name: string;
  layouts: Layouts;
  boxes: string[];
}

interface DashboardState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  isFocusMode: boolean; // NOVO

  // Espelhos para retrocompatibilidade
  layouts: Layouts;
  boxes: string[];
}

interface DashboardActions {
  addWorkspace: (name: string) => void;
  removeWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  toggleFocusMode: () => void; // NOVO

  setLayouts: (layouts: Layouts) => void;
  addBox: (type: string) => void;
  removeBox: (id: string) => void;
  resetDashboard: () => void;
  loadDashboardState: (boxes: string[], layouts: Layouts) => void;
}

// --- STORE ---

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  subscribeWithSelector(
    immer(
      persist(
        (set) => ({
          workspaces: [
            {
              id: "default",
              name: "Principal",
              layouts: DEFAULT_LAYOUTS,
              boxes: DEFAULT_BOXES,
            },
          ],
          activeWorkspaceId: "default",
          isFocusMode: false, // NOVO

          layouts: DEFAULT_LAYOUTS,
          boxes: DEFAULT_BOXES,

          // --- WORKSPACE ACTIONS ---

          addWorkspace: (name) =>
            set((state) => {
              const newId = crypto.randomUUID();
              const newWs: Workspace = {
                id: newId,
                name,
                layouts: { lg: [], md: [], sm: [] },
                boxes: [],
              };
              state.workspaces.push(newWs);
              state.activeWorkspaceId = newId;
              state.boxes = newWs.boxes;
              state.layouts = newWs.layouts;
            }),

          removeWorkspace: (id) =>
            set((state) => {
              if (state.workspaces.length <= 1) return;
              state.workspaces = state.workspaces.filter((w) => w.id !== id);
              if (state.activeWorkspaceId === id) {
                const nextWs = state.workspaces[0];
                state.activeWorkspaceId = nextWs.id;
                state.boxes = nextWs.boxes;
                state.layouts = nextWs.layouts;
              }
            }),

          setActiveWorkspace: (id) =>
            set((state) => {
              const ws = state.workspaces.find((w) => w.id === id);
              if (ws) {
                state.activeWorkspaceId = id;
                state.boxes = ws.boxes;
                state.layouts = ws.layouts;
              }
            }),

          renameWorkspace: (id, name) =>
            set((state) => {
              const ws = state.workspaces.find((w) => w.id === id);
              if (ws) ws.name = name;
            }),

          toggleFocusMode: () =>
            set((state) => {
              state.isFocusMode = !state.isFocusMode;
            }),

          // --- WIDGET ACTIONS ---

          setLayouts: (newLayouts) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (ws) {
                ws.layouts = newLayouts;
                state.layouts = newLayouts;
              }
            }),

          addBox: (type) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (!ws) return;

              const newId = generateId(type);
              const height = WIDGET_HEIGHTS[type] || WIDGET_HEIGHTS.default;

              ws.boxes.push(newId);

              (["lg", "md", "sm"] as const).forEach((bp) => {
                if (!ws.layouts[bp]) ws.layouts[bp] = [];
                const currentLayout = ws.layouts[bp];
                const numCols = COLS[bp];
                const colY = new Array(numCols).fill(0);

                currentLayout.forEach((item) => {
                  const bottom = (item.y || 0) + (item.h || 1);
                  for (
                    let i = item.x || 0;
                    i < (item.x || 0) + (item.w || 1) && i < numCols;
                    i++
                  ) {
                    if (bottom > colY[i]) colY[i] = bottom;
                  }
                });

                let targetX = 0;
                let minY = Infinity;
                for (let i = 0; i < numCols; i++) {
                  if (colY[i] < minY) {
                    minY = colY[i];
                    targetX = i;
                  }
                }

                ws.layouts[bp].push({
                  i: newId,
                  x: targetX,
                  y: Infinity,
                  w: 1,
                  h: height,
                });
              });

              state.boxes = ws.boxes;
              state.layouts = ws.layouts;
            }),

          removeBox: (id) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (!ws) return;

              ws.boxes = ws.boxes.filter((boxId) => boxId !== id);
              Object.keys(ws.layouts).forEach((bp) => {
                ws.layouts[bp] = ws.layouts[bp].filter((l) => l.i !== id);
              });

              state.boxes = ws.boxes;
              state.layouts = ws.layouts;
            }),

          resetDashboard: () =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (ws) {
                ws.layouts = DEFAULT_LAYOUTS;
                ws.boxes = DEFAULT_BOXES;
                state.layouts = DEFAULT_LAYOUTS;
                state.boxes = DEFAULT_BOXES;
              }
            }),

          loadDashboardState: (boxes, layouts) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (ws) {
                ws.boxes = boxes;
                ws.layouts = layouts;
                state.boxes = boxes;
                state.layouts = layouts;
              }
            }),
        }),
        {
          name: STORAGE_KEYS.DASHBOARD,
          partialize: (state) => ({
            workspaces: state.workspaces,
            activeWorkspaceId: state.activeWorkspaceId,
            layouts: state.layouts,
            boxes: state.boxes,
            // Não persistimos isFocusMode (sempre começa desligado)
          }),
          onRehydrateStorage: () => (state) => {
            if (
              state &&
              state.layouts &&
              (!state.workspaces || state.workspaces.length === 0)
            ) {
              const oldLayouts = state.layouts;
              const oldBoxes = state.boxes;
              const defaultWs = {
                id: "default",
                name: "Principal",
                layouts: oldLayouts || DEFAULT_LAYOUTS,
                boxes: oldBoxes || DEFAULT_BOXES,
              };
              state.workspaces = [defaultWs];
              state.activeWorkspaceId = "default";
              state.layouts = defaultWs.layouts;
              state.boxes = defaultWs.boxes;
            }
          },
        }
      )
    )
  )
);
