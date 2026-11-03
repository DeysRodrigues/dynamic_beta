import type { StorageAdapter } from "@/persistence/adapter";
import type { KeyValueStorage } from "@/persistence/storage";
import type { SyncEngine } from "./engine";

/**
 * The storage adapter used while signed in. It reads and writes the local copy exactly like the
 * plain one, so the app stays instant and offline-capable, and it tells the engine whenever
 * something was saved so the server hears about it.
 */
export function createSyncAdapter(local: KeyValueStorage, engine: SyncEngine): StorageAdapter {
  return {
    getItem: (key) => local.getItem(key),
    setItem(key, value) {
      local.setItem(key, value);
      engine.markDirty(key, value);
    },
    removeItem: (key) => local.removeItem(key),
    revisionOf: (key) => engine.revisionOf(key),
  };
}
