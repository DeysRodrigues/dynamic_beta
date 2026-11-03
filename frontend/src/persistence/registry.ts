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
  dashboard: { key: "dashboard-storage", version: 1 },
  tasks: { key: "tasks-storage", version: 1 },
  goals: { key: "goals-storage", version: 1 },
  tags: { key: "tags-storage", version: 1 },
  boxContent: { key: "box-content-storage", version: 1 },
  layoutTemplates: { key: "layout-templates-storage", version: 1 },
  customWidgets: { key: "custom-widgets-storage", version: 1 },
  weeks: { key: "weeks-storage", version: 1 },
  notifications: { key: "notification-storage", version: 1 },
  theme: { key: "theme-storage", version: 1 },
  pomodoro: { key: "pomodoro-global-storage", version: 1 },
  projects: { key: "projects-storage", version: 1 },
  userProfile: { key: "user-profile-storage", version: 1 },
  favorites: { key: "favorites-storage", version: 1 },
  /** Not a Zustand store: a bare counter written by the water widget. */
  waterCups: { key: "w-water-cups", version: 1 },
} as const;

export type PersistEntry = { readonly key: string; readonly version: number };

export const PERSISTED_KEYS: readonly string[] = Object.values(PERSISTED).map(
  (entry) => entry.key
);

/**
 * Options every persisted store shares: its key, its version and a `migrate`.
 *
 * Zustand throws away stored data whose version differs from the store's when there is no
 * `migrate`, so every store has one even while it is the identity. Data saved before
 * versioning existed (version 0) passes through unchanged.
 */
export function persistConfig(entry: PersistEntry) {
  return {
    name: entry.key,
    version: entry.version,
    migrate: (state: unknown) => state as never,
  };
}
