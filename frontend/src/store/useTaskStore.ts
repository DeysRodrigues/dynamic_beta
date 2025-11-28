import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task } from "@/types/Task";
import { STORAGE_KEYS } from "@/constants/storageKeys";

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  toggleCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  removeTasks: (ids: string[]) => void; // <--- NOVA FUNÇÃO
  deleteAllTasks: () => void;
  importTasks: (tasks: Task[]) => void;
  getUniqueTags: () => string[];
  getCompletedTimeByTag: () => Record<string, number>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      toggleCompleted: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            if (task.completed === undefined) return { ...task, completed: true };
            if (task.completed === true) return { ...task, completed: false };
            return { ...task, completed: undefined };
          }),
        })),

      deleteTask: (id) => {
        if (window.confirm("Excluir esta tarefa?")) {
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        }
      },

      // NOVA FUNÇÃO: Remove várias tarefas pelo ID sem pedir confirmação
      // (Útil para operações em massa onde a confirmação já foi feita antes)
      removeTasks: (ids) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => !ids.includes(t.id)),
        }));
      },

      deleteAllTasks: () => {
        if (window.confirm("Excluir TODAS as tarefas?")) {
          set({ tasks: [] });
        }
      },

      importTasks: (newTasks) =>
        set((state) => ({ tasks: [...state.tasks, ...newTasks] })),

      getUniqueTags: () => {
        const tags = get().tasks.map((t) => t.tag?.toLowerCase() || "");
        return Array.from(new Set(tags)).filter((t) => t.trim() !== "");
      },

      getCompletedTimeByTag: () => {
        return get().tasks.reduce<Record<string, number>>((acc, task) => {
          if (task.completed && task.tag) {
            const tagLower = task.tag.toLowerCase();
            acc[tagLower] = (acc[tagLower] || 0) + (task.duration || 0);
          }
          return acc;
        }, {});
      },
    }),
    {
      name: STORAGE_KEYS.TASKS,
      storage: createJSONStorage(() => localStorage),
    }
  )
);