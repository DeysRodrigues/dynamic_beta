import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BoxContentState {
  // Mapa de ID do Box -> Dados (ex: { "notepad-123": { text: "Olá" } })
  contents: Record<string, unknown>;
  setBoxContent: (boxId: string, data: unknown) => void;
  getBoxContent: (boxId: string) => unknown;
  // ADICIONADO: Função para carregar todo o conteúdo de uma vez (usado pelos Setups)
  loadAllContents: (contents: Record<string, unknown>) => void;
}

export const useBoxContentStore = create<BoxContentState>()(
  persist(
    (set, get) => ({
      contents: {},
      
      setBoxContent: (boxId, data) =>
        set((state) => {
          const current = state.contents[boxId] as Record<string, unknown> || {};
          const next = typeof data === 'object' && data !== null ? { ...current, ...data } : data;
          return {
            contents: {
              ...state.contents,
              [boxId]: next,
            },
          };
        }),
        
      getBoxContent: (boxId) => get().contents[boxId] || {},

      loadAllContents: (newContents) => set({ contents: newContents }),
    }),
    { name: "box-content-storage" }
  )
);