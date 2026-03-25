import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Project } from "@/types/Project";
import type { Layouts } from "react-grid-layout";

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
}

interface ProjectActions {
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  
  // Ações de Objetivos
  addGoal: (projectId: string, text: string) => void;
  removeGoal: (projectId: string, goalId: string) => void;
  toggleGoal: (projectId: string, goalId: string) => void;
  
  // Ações de Rotinas
  addRoutine: (projectId: string, text: string) => void;
  removeRoutine: (projectId: string, routineId: string) => void;
  toggleRoutine: (projectId: string, routineId: string, date: string) => void;
  
  // Atualizar Layout e Boxes
  updateProjectLayout: (projectId: string, layouts: Layouts) => void;
  addBoxToProject: (projectId: string, type: string) => void;
  removeBoxFromProject: (projectId: string, boxId: string) => void;
}

const WIDGET_HEIGHTS: Record<string, number> = {
  project_overview: 5,
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

const COLS = { lg: 4, md: 2, sm: 1 };

export const useProjectStore = create<ProjectState & ProjectActions>()(
  immer(
    persist(
      (set) => ({
        projects: [],
        activeProjectId: null,

        addProject: (project) =>
          set((state) => {
            state.projects.push(project);
          }),

        updateProject: (id, updates) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === id);
            if (project) {
              Object.assign(project, updates);
            }
          }),

        deleteProject: (id) =>
          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== id);
            if (state.activeProjectId === id) state.activeProjectId = null;
          }),

        setActiveProject: (id) =>
          set((state) => {
            state.activeProjectId = id;
          }),

        addGoal: (projectId, text) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              project.goals.push({
                id: crypto.randomUUID(),
                text,
                completed: false,
              });
            }
          }),

        removeGoal: (projectId, goalId) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              project.goals = project.goals.filter((g) => g.id !== goalId);
            }
          }),

        toggleGoal: (projectId, goalId) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              const goal = project.goals.find((g) => g.id === goalId);
              if (goal) goal.completed = !goal.completed;
            }
          }),

        addRoutine: (projectId, text) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              project.routines.push({
                id: crypto.randomUUID(),
                text,
                completedDates: [],
              });
            }
          }),

        removeRoutine: (projectId, routineId) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              project.routines = project.routines.filter((r) => r.id !== routineId);
            }
          }),

        toggleRoutine: (projectId, routineId, date) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              const routine = project.routines.find((r) => r.id === routineId);
              if (routine) {
                const index = routine.completedDates.indexOf(date);
                if (index === -1) {
                  routine.completedDates.push(date);
                } else {
                  routine.completedDates.splice(index, 1);
                }
              }
            }
          }),

        updateProjectLayout: (projectId, layouts) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              project.layouts = layouts;
            }
          }),

        addBoxToProject: (projectId, type) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (!project) return;

            const newId = `${type}-${crypto.randomUUID().slice(0, 8)}`;
            const height = WIDGET_HEIGHTS[type] || WIDGET_HEIGHTS.default;

            project.boxes.push(newId);

            (["lg", "md", "sm"] as const).forEach((bp) => {
              if (!project.layouts[bp]) project.layouts[bp] = [];
              const currentLayout = project.layouts[bp];
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

              project.layouts[bp].push({
                i: newId,
                x: targetX,
                y: Infinity,
                w: 1,
                h: height,
              });
            });
          }),

        removeBoxFromProject: (projectId, boxId) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (!project) return;

            project.boxes = project.boxes.filter((id) => id !== boxId);
            Object.keys(project.layouts).forEach((bp) => {
              project.layouts[bp] = project.layouts[bp].filter((l) => l.i !== boxId);
            });
          }),
      }),
      { name: "projects-storage" }
    )
  )
);
