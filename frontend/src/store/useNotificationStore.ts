import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    { name: "notification-storage" }
  )
);
