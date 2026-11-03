import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ZodType } from "zod";
import { persistConfig, PERSISTED } from "@/persistence/registry";

type Content = Record<string, unknown>;

interface BoxContentState {
  /** Box id -> its content, e.g. `{ "notepad-123": { text: "Olá" } }`. */
  contents: Record<string, unknown>;
  /**
   * Merges `data` into the box's content. With a `schema`, the merged result is validated first
   * and an invalid write is refused (and logged) instead of corrupting what is saved.
   */
  setBoxContent: (boxId: string, data: unknown, schema?: ZodType) => void;
  /**
   * Reads a box's content. With a `schema` the result is validated and typed; content that does
   * not match falls back to an empty one, so the widget shows its own defaults instead of
   * crashing. Without a schema the content is returned as it is stored.
   */
  getBoxContent: <T = Content>(boxId: string, schema?: ZodType<T>) => T;
  /** Replaces all the content at once (used when installing a setup). */
  loadAllContents: (contents: Record<string, unknown>) => void;
}

/** Validated content of a box, or an empty one when it does not match. Usable outside the store. */
export function readContent<T>(raw: unknown, schema: ZodType<T>, boxId = "?"): T {
  const parsed = schema.safeParse(raw ?? {});
  if (parsed.success) return parsed.data;
  console.warn(`[box-content] "${boxId}" does not match its schema, using defaults.`, parsed.error.issues);
  const empty = schema.safeParse({});
  return empty.success ? empty.data : ({} as T);
}

export const useBoxContentStore = create<BoxContentState>()(
  persist(
    (set, get) => ({
      contents: {},

      setBoxContent: (boxId, data, schema) =>
        set((state) => {
          const current = (state.contents[boxId] as Content) || {};
          const next = typeof data === "object" && data !== null ? { ...current, ...data } : data;

          if (schema) {
            const check = schema.safeParse(next);
            if (!check.success) {
              console.error(`[box-content] refused an invalid write to "${boxId}".`, check.error.issues);
              return state;
            }
          }

          return { contents: { ...state.contents, [boxId]: next } };
        }),

      getBoxContent: <T = Content,>(boxId: string, schema?: ZodType<T>): T => {
        const raw = get().contents[boxId] || {};
        return (schema ? readContent(raw, schema, boxId) : raw) as T;
      },

      loadAllContents: (newContents) => set({ contents: newContents }),
    }),
    { ...persistConfig(PERSISTED.boxContent) }
  )
);
