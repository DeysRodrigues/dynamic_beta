import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layouts } from "react-grid-layout";
import { persistConfig, PERSISTED } from "@/persistence/registry";

// Shape of a saved theme (colors, wallpaper, etc.)
export interface SavedThemeState {
  wallpaper: string;
  customImage: string | null;
  sidebarColor: string;
  primaryColor: string;
  boxOpacity: number;
  boxColor: string;
  textColor: string;
  backgroundColor: string;
}

// Define o Template Completo
export interface LayoutTemplate {
  id: string;
  name: string;
  boxes: string[];
  layouts: Layouts;
  theme?: SavedThemeState;
  content?: Record<string, unknown>;
  createdAt: string;
}

interface LayoutTemplateState {
  templates: LayoutTemplate[];
  saveTemplate: (
    name: string, 
    boxes: string[], 
    layouts: Layouts, 
    theme?: SavedThemeState, 
    content?: Record<string, unknown>
  ) => void;
  deleteTemplate: (id: string) => void;
  importTemplate: (template: LayoutTemplate) => void;
}

export const useLayoutTemplateStore = create<LayoutTemplateState>()(
  persist(
    (set) => ({
      templates: [],

      saveTemplate: (name, boxes, layouts, theme, content) => {
        const newTemplate: LayoutTemplate = {
          id: crypto.randomUUID(),
          name,
          boxes,
          layouts,
          theme,   // Saves the colors and wallpaper
          content, // Saves the inner data
          createdAt: new Date().toISOString(),
        };
        
        // Adds to the start of the list
        set((state) => ({ templates: [newTemplate, ...state.templates] }));
      },

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      importTemplate: (template) =>
        set((state) => ({
          templates: [
            ...state.templates.filter((t) => t.id !== template.id),
            template,
          ],
        })),
    }),
    { ...persistConfig(PERSISTED.layoutTemplates) }
  )
);