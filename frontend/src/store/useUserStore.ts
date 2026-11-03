import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistConfig, PERSISTED } from "@/persistence/registry";

interface UserState {
  name: string;
  subtitle: string;
  avatar: string | null; // Base64 da imagem
  setName: (name: string) => void;
  setSubtitle: (sub: string) => void;
  setAvatar: (img: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: "Viajante",
      subtitle: "Produtividade & Foco",
      avatar: null, // Se null, usa uma imagem padrão
      setName: (name) => set({ name }),
      setSubtitle: (subtitle) => set({ subtitle }),
      setAvatar: (avatar) => set({ avatar }),
    }),
    { ...persistConfig(PERSISTED.userProfile) }
  )
);
