import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task } from "@/types/Task";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { useTagStore } from "./useTagStore";

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  toggleCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  removeTasks: (ids: string[]) => void;
  deleteAllTasks: () => void;
  importTasks: (tasks: Task[]) => void;
  getUniqueTags: () => string[];
  getCompletedTimeByTag: () => Record<string, number>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        const { addTag } = useTagStore.getState();
        if (task.tag) addTag(task.tag);
        if (task.groupTag) addTag(task.groupTag);
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
        const { addTag } = useTagStore.getState();
        if (data.tag) addTag(data.tag);
        if (data.groupTag) addTag(data.groupTag);
      },

      toggleCompleted: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, completed: !task.completed };
          }),
        })),

      deleteTask: (id) => {
        if (window.confirm("Excluir esta tarefa?")) {
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        }
      },

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

      importTasks: (newTasks) => {
        set((state) => ({ tasks: [...state.tasks, ...newTasks] }));
        const { addTag } = useTagStore.getState();
        newTasks.forEach(t => {
            if (t.tag) addTag(t.tag);
            if (t.groupTag) addTag(t.groupTag);
        });
      },

      getUniqueTags: () => {
        const tags = get().tasks.map((t) => t.tag?.toLowerCase() || "");
        return Array.from(new Set(tags)).filter((t) => t.trim() !== "");
      },

      getCompletedTimeByTag: () => {
        return get().tasks.reduce<Record<string, number>>((acc, task) => {
          // Só conta se estiver concluída
          if (task.completed) {
            const duration = task.duration || 0;

            // 1. Conta para a Tag Normal (ex: "matemática")
            if (task.tag) {
              const tagLower = task.tag.toLowerCase();
              acc[tagLower] = (acc[tagLower] || 0) + duration;
            }

            // 2. Conta TAMBÉM para a Tagzona (ex: "Faculdade")
            // Isso permite metas amplas como "Estudar 4h de Faculdade por dia"
            if (task.groupTag) {
              const groupLower = task.groupTag.toLowerCase();
              acc[groupLower] = (acc[groupLower] || 0) + duration;
            }
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