import { create } from "zustand";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useTagStore } from "@/store/useTagStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useLayoutTemplateStore } from "@/store/useLayoutTemplateStore";
import { useCustomWidgetStore } from "@/store/useCustomWidgetStore";
import { useWeekStore } from "@/store/useWeekStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useThemeStore } from "@/store/useThemeStore";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useUserStore } from "@/store/useUserStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { onHydrationError } from "./status";

interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    rehydrate: () => void | Promise<void>;
    onHydrate: (listener: () => void) => () => void;
    onFinishHydration: (listener: () => void) => () => void;
  };
}

/** Every persisted store. `stores.test.ts` checks this list against the registry. */
export const PERSISTED_STORES: readonly PersistedStore[] = [
  useDashboardStore, useTaskStore, useGoalStore, useTagStore, useBoxContentStore,
  useLayoutTemplateStore, useCustomWidgetStore, useWeekStore, useNotificationStore,
  useThemeStore, usePomodoroStore, useProjectStore, useUserStore, useFavoriteStore,
];

interface HydrationState {
  /** True once every persisted store has read its data. */
  hydrated: boolean;
  /** Set when a read failed; the data is then still where it was, and nothing was overwritten. */
  error: string | null;
}

const allHydrated = () => PERSISTED_STORES.every((store) => store.persist.hasHydrated());

/**
 * Whether the app's data has been read yet. With `localStorage` this is true from the first
 * render; with a slow or remote adapter it turns true later, and the screen waits for it, so a
 * widget never starts from empty defaults and then saves them over the real content.
 */
export const useHydration = create<HydrationState>(() => ({ hydrated: allHydrated(), error: null }));

const refresh = () => useHydration.setState({ hydrated: allHydrated() });

for (const store of PERSISTED_STORES) {
  store.persist.onHydrate(refresh); // a rehydrate starts: the screen has to wait again
  store.persist.onFinishHydration(() => {
    refresh();
    if (allHydrated()) useHydration.setState({ error: null });
  });
}

onHydrationError((message) => useHydration.setState({ error: message }));

/** Reads every store again from the current adapter, e.g. after a login. */
export async function rehydrateAll(): Promise<void> {
  useHydration.setState({ error: null });
  await Promise.all(PERSISTED_STORES.map((store) => store.persist.rehydrate()));
}

/** Resolves once every store has been read. */
export function whenHydrated(): Promise<void> {
  if (allHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useHydration.subscribe((state) => {
      if (state.hydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
}
