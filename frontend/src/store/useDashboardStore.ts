import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Layouts } from "react-grid-layout";
import { persistConfig, PERSISTED } from "@/persistence/registry";
import { migrateDashboard } from "@/persistence/migrations";
import { getDefaultHeight } from "@/widgets/registry";
import { boxFromLegacyId, createBox } from "@/utils/BoxFactory";
import type { BoxRef } from "@/types/Box";
import { addBoxToLayouts } from "@/utils/layout";

// --- CONFIGURAÇÃO ---

const DEFAULT_BOXES: BoxRef[] = ["tasks", "progress", "pomodoro", "tags"].map((type) => ({
  id: type,
  type,
}));

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

// --- TYPES ---

export interface Workspace {
  id: string;
  name: string;
  layouts: Layouts;
  boxes: BoxRef[];
}

interface DashboardState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  isFocusMode: boolean;
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
  /** Replaces the active workspace with a saved setup. Boxes come as bare ids. */
  loadDashboardState: (boxIds: string[], layouts: Layouts) => void;
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
          isFocusMode: false,

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
            }),

          removeWorkspace: (id) =>
            set((state) => {
              if (state.workspaces.length <= 1) return;
              state.workspaces = state.workspaces.filter((w) => w.id !== id);
              if (state.activeWorkspaceId === id) {
                const nextWs = state.workspaces[0];
                state.activeWorkspaceId = nextWs.id;
              }
            }),

          setActiveWorkspace: (id) =>
            set((state) => {
              const ws = state.workspaces.find((w) => w.id === id);
              if (ws) {
                state.activeWorkspaceId = id;
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
              }
            }),

          addBox: (type) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (!ws) return;

              const box = createBox(type);
              ws.boxes.push(box);
              addBoxToLayouts(ws.layouts, box.id, getDefaultHeight(type));

            }),

          removeBox: (id) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (!ws) return;

              ws.boxes = ws.boxes.filter((box) => box.id !== id);
              Object.keys(ws.layouts).forEach((bp) => {
                ws.layouts[bp] = ws.layouts[bp].filter((l) => l.i !== id);
              });

            }),

          resetDashboard: () =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (ws) {
                ws.layouts = DEFAULT_LAYOUTS;
                ws.boxes = DEFAULT_BOXES;
              }
            }),

          loadDashboardState: (boxIds, layouts) =>
            set((state) => {
              const ws = state.workspaces.find(
                (w) => w.id === state.activeWorkspaceId
              );
              if (ws) {
                ws.boxes = boxIds.map(boxFromLegacyId);
                ws.layouts = layouts;
              }
            }),
        }),
        {
          ...persistConfig(PERSISTED.dashboard, migrateDashboard),
          partialize: (state) => ({
            workspaces: state.workspaces,
            activeWorkspaceId: state.activeWorkspaceId,
            // isFocusMode is not persisted: it always starts off.
          }),
        }
      )
    )
  )
);

/** The workspace currently on screen. Every box and layout of the dashboard lives here. */
export const selectActiveWorkspace = (state: {
  workspaces: Workspace[];
  activeWorkspaceId: string;
}) => state.workspaces.find((w) => w.id === state.activeWorkspaceId);
