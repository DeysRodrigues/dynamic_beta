import { createJSONStorage } from "zustand/middleware";
import { appStorage } from "./adapter";

/**
 * Single list of everything the app persists in the browser.
 *
 * Every Zustand store takes its key and version from here, and the backup, restore and reset
 * all read the same list, so none of them can forget a piece of data.
 *
 * `version` is the shape of the stored data. When a store changes its shape, bump the version
 * and handle the old one in that store's `migrate`.
 */
export const PERSISTED = {
  dashboard: { key: "dashboard-storage", version: 2, label: "Painéis e widgets" },
  tasks: { key: "tasks-storage", version: 1, label: "Tarefas" },
  goals: { key: "goals-storage", version: 1, label: "Metas" },
  tags: { key: "tags-storage", version: 1, label: "Tags" },
  boxContent: { key: "box-content-storage", version: 1, label: "Conteúdo dos widgets" },
  layoutTemplates: { key: "layout-templates-storage", version: 1, label: "Modelos de layout" },
  customWidgets: { key: "custom-widgets-storage", version: 1, label: "Widgets personalizados" },
  weeks: { key: "weeks-storage", version: 1, label: "Planejador semanal" },
  planBoard: { key: "plan-board-storage", version: 2, label: "Quadro de planejamento" },
  notifications: { key: "notification-storage", version: 1, label: "Notificações" },
  theme: { key: "theme-storage", version: 1, label: "Tema e cores" },
  pomodoro: { key: "pomodoro-global-storage", version: 1, label: "Pomodoro" },
  projects: { key: "projects-storage", version: 2, label: "Projetos" },
  userProfile: { key: "user-profile-storage", version: 1, label: "Perfil" },
  favorites: { key: "favorites-storage", version: 1, label: "Favoritos" },
  /** Not a Zustand store: a bare counter written by the water widget. */
  waterCups: { key: "w-water-cups", version: 1, label: "Copos de água" },
} as const;

export type PersistEntry = { readonly key: string; readonly version: number; readonly label?: string };

/** The key, version and label of everything that is saved, for code that walks the whole list. */
export const PERSISTED_ENTRIES: readonly Required<PersistEntry>[] = Object.values(PERSISTED);

/** A name a person would recognise for a saved key, e.g. "Tarefas". */
export function labelForKey(key: string): string {
  return PERSISTED_ENTRIES.find((entry) => entry.key === key)?.label ?? key;
}

export const PERSISTED_KEYS: readonly string[] = Object.values(PERSISTED).map(
  (entry) => entry.key
);

/**
 * Options every persisted store shares: its key, its version and a `migrate`.
 *
 * Zustand throws away stored data whose version differs from the store's when there is no
 * `migrate`, so every store has one. Pass a migration when the shape changes; without one it is
 * the identity. It receives the stored state and the version it was saved with, and data saved
 * before versioning existed arrives as version 0.
 */
export function persistConfig(
  entry: PersistEntry,
  migrate: (state: unknown, version: number) => unknown = (state) => state
) {
  return {
    name: entry.key,
    version: entry.version,
    migrate: migrate as (state: unknown, version: number) => never,
    // Through the shared storage, so the adapter can be swapped and a write never beats a read.
    storage: createJSONStorage(() => appStorage),
  };
}
