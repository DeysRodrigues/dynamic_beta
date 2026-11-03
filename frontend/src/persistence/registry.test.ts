import { describe, it, expect } from "vitest";
import { PERSISTED, PERSISTED_KEYS, persistConfig } from "./registry";

describe("registry", () => {
  it("tem as 15 chaves, sem repetir nenhuma", () => {
    expect(PERSISTED_KEYS).toHaveLength(15);
    expect(new Set(PERSISTED_KEYS).size).toBe(15);
  });

  it("cada entrada tem versão inteira a partir de 1", () => {
    for (const entry of Object.values(PERSISTED)) {
      expect(Number.isInteger(entry.version)).toBe(true);
      expect(entry.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("persistConfig entrega nome, versão e um migrate que não altera o dado", () => {
    const cfg = persistConfig(PERSISTED.tasks);
    expect(cfg.name).toBe("tasks-storage");
    expect(cfg.version).toBe(1);
    const data = { a: 1 };
    expect(cfg.migrate(data)).toBe(data);
  });
});
