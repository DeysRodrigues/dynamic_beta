import { PERSISTED_KEYS } from "./registry";
import { browserStorage, type KeyValueStorage } from "./storage";

// Kept as in the first backup files so those still import.
const BACKUP_APP = "Dynamic Notes";
const BACKUP_VERSION = "0.5.0";

export interface BackupFile {
  meta: { app: string; version: string; date: string };
  data: Record<string, unknown>;
}

/** Reads every registered key into one backup object. Keys that were never written are skipped. */
export function createBackup(
  storage: KeyValueStorage = browserStorage,
  now: Date = new Date()
): BackupFile {
  const data: Record<string, unknown> = {};

  for (const key of PERSISTED_KEYS) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }

  return {
    meta: { app: BACKUP_APP, version: BACKUP_VERSION, date: now.toISOString() },
    data,
  };
}

/** Throws if the parsed JSON is not a backup made by this app. */
export function assertValidBackup(value: unknown): asserts value is BackupFile {
  const file = value as Partial<BackupFile> | null;
  if (!file || file.meta?.app !== BACKUP_APP || !file.data || typeof file.data !== "object") {
    throw new Error("Invalid file, or made by another app.");
  }
}

/**
 * Writes a backup back into storage. Only registered keys are restored, so a crafted file
 * cannot write arbitrary keys. Returns the keys that were written.
 */
export function restoreBackup(
  backup: BackupFile,
  storage: KeyValueStorage = browserStorage
): string[] {
  const restored: string[] = [];

  for (const key of PERSISTED_KEYS) {
    if (!(key in backup.data)) continue;
    const value = backup.data[key];
    storage.setItem(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    restored.push(key);
  }

  return restored;
}

/** Removes only the keys the app owns, leaving anything else on the same origin alone. */
export function clearAppData(storage: KeyValueStorage = browserStorage): void {
  for (const key of PERSISTED_KEYS) storage.removeItem(key);
}
