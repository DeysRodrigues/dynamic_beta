import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistConfig, PERSISTED } from "@/persistence/registry";

interface TagState {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
}

export const useTagStore = create<TagState>()(
  persist(
    (set) => ({
      tags: [],
      addTag: (tag) => {
        const trimmed = tag.trim();
        if (trimmed) {
          set((state) => {
            // Evita duplicatas
            if (state.tags.includes(trimmed)) return state;
            return { tags: [...state.tags, trimmed] };
          });
        }
      },
      removeTag: (index) =>
        set((state) => ({ tags: state.tags.filter((_, i) => i !== index) })),
    }),
    { ...persistConfig(PERSISTED.tags) }
  )
);