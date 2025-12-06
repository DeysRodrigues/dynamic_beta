import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layouts } from "react-grid-layout";

// Define a estrutura do Tema salvo (Cores, Papel de parede, etc)
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
  theme?: SavedThemeState;       // <--- AGORA SALVA O TEMA
  content?: Record<string, any>; // <--- AGORA SALVA O CONTEÚDO (Links, Textos)
  createdAt: string;
}

interface LayoutTemplateState {
  templates: LayoutTemplate[];
  // Atualizei a assinatura da função para aceitar tema e conteúdo
  saveTemplate: (
    name: string, 
    boxes: string[], 
    layouts: Layouts, 
    theme?: SavedThemeState, 
    content?: Record<string, any>
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
          theme,   // Salva as cores/wallpaper
          content, // Salva os dados internos
          createdAt: new Date().toISOString(),
        };
        
        // Adiciona no início da lista
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
    { name: "layout-templates-storage" }
  )
);