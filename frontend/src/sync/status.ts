import { create } from "zustand";
import type { ServerDocument } from "./api";

/** Where the sync stands, for the screen. */
export type SyncStatus = "local" | "syncing" | "synced" | "offline" | "conflict" | "error";

/** A saved key that changed on both sides, waiting for the person to pick one. */
export interface Conflict {
  key: string;
  label: string;
  server: ServerDocument;
}

/** A saved key that is in step with the server, and when it last was. */
export interface SyncedDocument {
  key: string;
  label: string;
  revision: number;
  /** When this device last sent it or received it, as a timestamp. */
  at: number;
}

interface SyncState {
  status: SyncStatus;
  /** What the server is known to have, for the account page. */
  documents: SyncedDocument[];
  /** How many keys changed here and are still waiting to be sent. */
  pending: number;
  /** When the last full sync finished, as a timestamp. */
  lastSyncAt: number | null;
  conflicts: Conflict[];
  /** An error code worth telling the person about, e.g. "app_outdated". */
  problem: string | null;
}

export const useSync = create<SyncState>(() => ({ status: "local", documents: [], pending: 0, lastSyncAt: null, conflicts: [], problem: null }));
