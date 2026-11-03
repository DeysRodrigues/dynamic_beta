import { describe, it, expect } from "vitest";
import { PERSISTED_KEYS } from "./registry";

// Importing every store registers its persist key. Each Zustand store with persist exposes
// `persist.getOptions().name`, so the registry and the stores cannot drift apart.
const modules = import.meta.glob("../store/use*Store.ts", { eager: true }) as Record<
  string,
  Record<string, { persist?: { getOptions: () => { name?: string; version?: number } } }>
>;

describe("stores x registry", () => {
  const options = Object.values(modules)
    .flatMap((m) => Object.values(m))
    .filter((s) => s?.persist)
    .map((s) => s.persist!.getOptions());

  it("há 14 stores persistidas", () => {
    expect(options).toHaveLength(14);
  });

  it("cada store usa uma chave que está no registro", () => {
    for (const o of options) expect(PERSISTED_KEYS).toContain(o.name);
  });

  it("toda store tem versão e migrate", () => {
    for (const o of options) {
      expect(o.version).toBeGreaterThanOrEqual(1);
      expect((o as { migrate?: unknown }).migrate).toBeTypeOf("function");
    }
  });
});

describe("dado salvo antes do versionamento", () => {
  it("uma store carrega o que foi salvo na versão 0, sem descartar", async () => {
    const { useTagStore } = await import("../store/useTagStore");
    localStorage.setItem("tags-storage", JSON.stringify({ state: { tags: ["uni", "casa"] }, version: 0 }));

    await useTagStore.persist.rehydrate();

    expect(useTagStore.getState().tags).toEqual(["uni", "casa"]);
  });
});
