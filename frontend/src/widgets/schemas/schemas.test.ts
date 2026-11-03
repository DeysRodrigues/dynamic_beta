import { describe, it, expect } from "vitest";
import { notepadContentSchema } from "./notepad";
import { snippetContentSchema } from "./snippet";
import { quickLinksContentSchema } from "./quicklinks";
import { bookTrackerContentSchema } from "./books";
import { libraryContentSchema } from "./library";
import { presenceContentSchema } from "./presence";
import { automationContentSchema } from "./automation";
import { widgetRegistry } from "../registry";

describe("schemas aceitam conteúdo válido", () => {
  it.each([
    ["notepad", notepadContentSchema, { text: "oi" }],
    ["snippet", snippetContentSchema, { snippets: [{ id: "1", title: "t", code: "c", type: "ts" }], customTypes: [{ id: "x", label: "X", color: "text-red-500", isCustom: true }] }],
    ["quicklinks", quickLinksContentSchema, { categories: [{ id: "a", name: "A", links: [{ id: "1", title: "T", url: "https://x.com" }] }], viewMode: "grid" }],
    ["books", bookTrackerContentSchema, { books: [{ id: "1", title: "T", current: 3, total: 100, color: "bg-blue-500" }], settings: { pageStep: 10 } }],
    ["library", libraryContentSchema, { categories: [{ id: "1", name: "G", icon: "book", color: "red" }], books: [{ id: "1", title: "T", categoryId: "1", completed: false, color: "#fff", height: 40, pattern: 1 }], settings: { woodColor: "a", wallColor: "b" } }],
    ["presence", presenceContentSchema, { events: [{ id: "1", title: "Aula", startDate: "2026-01-01", endDate: "2026-06-01", daysOfWeek: [1, 3], presences: [], absences: [] }], activeEventId: "1" }],
    ["automation", automationContentSchema, { rules: [{ id: "1", name: "R", trigger: "time", triggerValue: "08:00", action: "notify", actionValue: "oi", active: true }] }],
  ])("%s", (_name, schema, value) => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["notepad", notepadContentSchema], ["snippet", snippetContentSchema], ["quicklinks", quickLinksContentSchema],
    ["books", bookTrackerContentSchema], ["library", libraryContentSchema], ["presence", presenceContentSchema],
    ["automation", automationContentSchema],
  ])("%s aceita conteúdo vazio (widget recém-criado)", (_n, schema) => {
    expect(schema.safeParse({}).success).toBe(true);
  });

  it("livro da estante sem categoria (formato antigo) é válido", () => {
    const r = libraryContentSchema.safeParse({ books: [{ id: "1", title: "T", completed: true, color: "x", height: 40, pattern: 0 }] });
    expect(r.success).toBe(true);
  });
});

describe("schemas recusam conteúdo corrompido", () => {
  it("tipos errados", () => {
    expect(notepadContentSchema.safeParse({ text: 42 }).success).toBe(false);
    expect(bookTrackerContentSchema.safeParse({ books: [{ id: "1", title: "T", current: "3", total: 100, color: "x" }] }).success).toBe(false);
    expect(quickLinksContentSchema.safeParse({ viewMode: "tabela" }).success).toBe(false);
    expect(automationContentSchema.safeParse({ rules: [{ id: "1", name: "R", trigger: "lua", triggerValue: "", action: "notify", actionValue: "", active: true }] }).success).toBe(false);
  });
  it("lista no lugar errado", () => {
    expect(presenceContentSchema.safeParse({ events: "nada" }).success).toBe(false);
    expect(snippetContentSchema.safeParse({ snippets: { id: "1" } }).success).toBe(false);
  });
});

describe("registro", () => {
  it("os 7 widgets de dado pesado declaram schema", () => {
    for (const id of ["notepad", "snippet", "quicklinks", "books", "library", "presence", "auto"]) {
      expect(widgetRegistry[id].schema, id).toBeDefined();
    }
  });
});
