import type { StateStorage } from "zustand/middleware";
import { browserStorage } from "./storage";
import { reportHydrationError } from "./status";

type MaybePromise<T> = T | Promise<T>;

/**
 * Where the app's persisted data actually lives. Two implementations are meant to exist: the
 * browser's `localStorage` (the default, instant) and, later, a server.
 *
 * Every method may answer at once or later: the app must work with a store that takes half a
 * second to respond, so nothing may assume a read has finished.
 */
export interface StorageAdapter {
  getItem(key: string): MaybePromise<string | null>;
  setItem(key: string, value: string): MaybePromise<void>;
  removeItem(key: string): MaybePromise<void>;
  /**
   * The revision of a key as the backend last confirmed it, for the conflict check on a write.
   * `localStorage` has none.
   */
  revisionOf?(key: string): number | undefined;
}

export const localStorageAdapter: StorageAdapter = {
  getItem: (key) => browserStorage.getItem(key),
  setItem: (key, value) => browserStorage.setItem(key, value),
  removeItem: (key) => browserStorage.removeItem(key),
};

const isPromise = <T>(value: MaybePromise<T>): value is Promise<T> =>
  typeof (value as Promise<T> | undefined)?.then === "function";

let adapter: StorageAdapter = localStorageAdapter;
const readKeys = new Set<string>();
const revisions = new Map<string, number>();

function noteRevision(key: string) {
  const revision = adapter.revisionOf?.(key);
  if (revision !== undefined) revisions.set(key, revision);
}

/**
 * Points every store at another adapter. Nothing counts as read until it is read from it, unless
 * `keepReads` says the new adapter serves the very same data the old one did (the synced adapter
 * reads the local copy, like the local one), in which case the stores are still valid and must
 * keep saving.
 */
export function setStorageAdapter(next: StorageAdapter, options: { keepReads?: boolean } = {}) {
  adapter = next;
  if (!options.keepReads) {
    readKeys.clear();
    revisions.clear();
  }
}

/** The revision the client last saw for a key, or `undefined` when the adapter has none. */
export function getRevision(key: string): number | undefined {
  return revisions.get(key);
}

/** Whether a key has been read from the current adapter yet. */
export function hasRead(key: string): boolean {
  return readKeys.has(key);
}

/**
 * The storage every persisted store uses. It forwards to the current adapter, and adds the two
 * rules that make a slow or remote adapter safe:
 *
 * - **Never write before reading.** A write for a key that has not been read yet is dropped. A
 *   store starts out with its defaults, so saving them before the real data arrived would
 *   overwrite it with an empty version of itself.
 * - **Remember the revision** of each key, which the backend needs to detect a conflict.
 *
 * An adapter that answers at once keeps the whole thing synchronous, so with `localStorage` the
 * stores are hydrated before the first render, as they always were.
 */
export const appStorage: StateStorage = {
  getItem(key) {
    const result = adapter.getItem(key);

    if (isPromise(result)) {
      return result.then(
        (value) => {
          readKeys.add(key);
          noteRevision(key);
          return value;
        },
        (error: unknown) => {
          // The read failed, so the key stays unread and its writes stay blocked: better to show
          // an error than to save defaults over data that is still on the other side.
          reportHydrationError(key, error);
          throw error;
        }
      );
    }

    readKeys.add(key);
    noteRevision(key);
    return result;
  },

  setItem(key, value) {
    if (!readKeys.has(key)) {
      if (import.meta.env?.DEV) console.warn(`[persistence] dropped a write to "${key}" made before it was read.`);
      return;
    }
    const result = adapter.setItem(key, value);
    if (isPromise(result)) return result.then(() => noteRevision(key));
    noteRevision(key);
    return result;
  },

  removeItem(key) {
    return adapter.removeItem(key);
  },
};
