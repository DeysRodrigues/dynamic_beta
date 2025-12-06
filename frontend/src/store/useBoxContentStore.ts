import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BoxContentState {
  // Mapa de ID do Box -> Dados (ex: { "notepad-123": { text: "Olá" } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contents: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setBoxContent: (boxId: string, data: any) => void;
  getBoxContent: (boxId: string) => any;
  // ADICIONADO: Função para carregar todo o conteúdo de uma vez (usado pelos Setups)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadAllContents: (contents: Record<string, any>) => void;
}

export const useBoxContentStore = create<BoxContentState>()(
  persist(
    (set, get) => ({
      contents: {},
      
      setBoxContent: (boxId, data) =>
        set((state) => ({
          contents: {
            ...state.contents,
            [boxId]: { ...state.contents[boxId], ...data },
          },
        })),
        
      getBoxContent: (boxId) => get().contents[boxId] || {},

      loadAllContents: (newContents) => set({ contents: newContents }),
    }),
    { name: "box-content-storage" }
  )
);