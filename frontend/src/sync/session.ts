import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Account } from "./api";

interface SessionState {
  serverUrl: string | null;
  token: string | null;
  user: Account | null;
  setSession: (serverUrl: string, token: string, user: Account) => void;
  clearSession: () => void;
}

/**
 * Who is signed in and to which server. It is deliberately NOT in the persistence registry: it
 * is not part of the data, so it must not go into a backup, be synced, or be wiped by "reset".
 */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      serverUrl: null,
      token: null,
      user: null,
      setSession: (serverUrl, token, user) => set({ serverUrl, token, user }),
      clearSession: () => set({ serverUrl: null, token: null, user: null }),
    }),
    { name: "dynabox-session" }
  )
);
