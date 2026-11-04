import { create } from "zustand";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useTagStore } from "@/store/useTagStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useLayoutTemplateStore } from "@/store/useLayoutTemplateStore";
import { useCustomWidgetStore } from "@/store/useCustomWidgetStore";
import { useWeekStore } from "@/store/useWeekStore";
import { usePlanBoardStore } from "@/store/usePlanBoardStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useThemeStore } from "@/store/useThemeStore";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useUserStore } from "@/store/useUserStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { PERSISTED } from "./registry";
import { onHydrationError } from "./status";
import { stableStringify as stableJson } from "@/sync/json";

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
  useLayoutTemplateStore, useCustomWidgetStore, useWeekStore, usePlanBoardStore, useNotificationStore,
  useThemeStore, usePomodoroStore, useProjectStore, useUserStore, useFavoriteStore,
];

interface HydrationState {
  /** True once every persisted store has read its data. */
  hydrated: boolean;
  /** Goes up when content changed behind the widgets' back, so they start over from it. */
  epoch: number;
  /** Set when a read failed; the data is then still where it was, and nothing was overwritten. */
  error: string | null;
}

const allHydrated = () => PERSISTED_STORES.every((store) => store.persist.hasHydrated());

/**
 * Whether the app's data has been read yet. With `localStorage` this is true from the first
 * render; with a slow or remote adapter it turns true later, and the screen waits for it, so a
 * widget never starts from empty defaults and then saves them over the real content.
 */
export const useHydration = create<HydrationState>(() => ({ hydrated: allHydrated(), epoch: 0, error: null }));

const refresh = () => useHydration.setState({ hydrated: allHydrated() });

// While a single store is reloaded in the background the screen must not go blank.
let quietReloads = 0;

for (const store of PERSISTED_STORES) {
  store.persist.onHydrate(() => {
    if (!quietReloads) refresh(); // a rehydrate starts: the screen has to wait again
  });
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

const storeOf = (key: string) =>
  PERSISTED_STORES.find((store) => (store as unknown as { persist: { getOptions: () => { name?: string } } }).persist.getOptions().name === key);

/**
 * Reads one store again from the current adapter without hiding the screen, for when a newer copy
 * of it arrived from the server. Returns whether a store with that key exists.
 */
export async function rehydrateKeyQuietly(key: string): Promise<boolean> {
  const store = storeOf(key);
  if (!store) return false;
  quietReloads++;
  try {
    await store.persist.rehydrate();
  } finally {
    quietReloads--;
  }
  return true;
}

/**
 * Whether a saved value is just what the store starts with, i.e. nothing a person made. Used to
 * tell a fresh browser from one with real data.
 */
export function isDefaultValue(key: string, value: unknown): boolean {
  const comparable = (v: unknown) => stableJson(JSON.parse(JSON.stringify(v) ?? "null"));
  if (key === PERSISTED.waterCups.key) return value === 0;

  const store = storeOf(key) as unknown as
    | { getInitialState: () => object; persist: { getOptions: () => { partialize?: (state: object) => unknown; version?: number } } }
    | undefined;
  if (!store) return false;

  const { partialize, version } = store.persist.getOptions();
  const defaults = { state: (partialize ?? ((state) => state))({ ...store.getInitialState() }), version };
  try {
    return comparable(value) === comparable(defaults);
  } catch {
    return false;
  }
}

/** Makes every widget start over from what is saved. */
export function bumpEpoch() {
  useHydration.setState((state) => ({ epoch: state.epoch + 1 }));
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
