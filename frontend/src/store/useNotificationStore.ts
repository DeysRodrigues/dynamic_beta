import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistConfig, PERSISTED } from "@/persistence/registry";

interface NotificationState {
  lastSeenVersion: string | null;
  markAsSeen: (version: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      lastSeenVersion: null, // Começa vazio
      markAsSeen: (version) => set({ lastSeenVersion: version }),
    }),
    { ...persistConfig(PERSISTED.notifications) }
  )
);
