import { create } from "zustand";

/** Whether the person closed the conflict dialog to decide later. Reset when the conflicts change. */
export const useConflictUi = create<{ dismissedFor: string | null; dismiss: (signature: string) => void; reopen: () => void }>((set) => ({
  dismissedFor: null,
  dismiss: (signature) => set({ dismissedFor: signature }),
  reopen: () => set({ dismissedFor: null }),
}));
