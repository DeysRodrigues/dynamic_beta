import { describe, it, expect, beforeEach } from "vitest";
import { createBackup, restoreBackup, assertValidBackup, clearAppData } from "./backup";
import { PERSISTED, PERSISTED_KEYS } from "./registry";
import type { KeyValueStorage } from "./storage";

function memoryStorage(): KeyValueStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

let storage: ReturnType<typeof memoryStorage>;

beforeEach(() => {
  storage = memoryStorage();
  for (const key of PERSISTED_KEYS) {
    storage.setItem(
      key,
      key === PERSISTED.waterCups.key ? "3" : JSON.stringify({ state: { marker: key }, version: 1 })
    );
  }
});

describe("createBackup", () => {
  it("inclui todas as 16 chaves do registro (inclusive projetos, perfil e favoritos)", () => {
    const { data } = createBackup(storage);
    expect(Object.keys(data).sort()).toEqual([...PERSISTED_KEYS].sort());
    expect(data).toHaveProperty("projects-storage");
    expect(data).toHaveProperty("user-profile-storage");
    expect(data).toHaveProperty("favorites-storage");
  });

  it("pula chave que nunca foi escrita", () => {
    storage.removeItem(PERSISTED.theme.key);
    expect(createBackup(storage).data).not.toHaveProperty("theme-storage");
  });

  it("ignora chaves que não são do app", () => {
    storage.setItem("outra-coisa", "x");
    expect(createBackup(storage).data).not.toHaveProperty("outra-coisa");
  });
});

describe("ida e volta: exportar, limpar, importar", () => {
  it("devolve o storage exatamente como estava", () => {
    const before = new Map(storage.map);
    const file = JSON.parse(JSON.stringify(createBackup(storage)));

    clearAppData(storage);
    expect(storage.map.size).toBe(0);

    assertValidBackup(file);
    restoreBackup(file, storage);

    for (const key of PERSISTED_KEYS) {
      const original = before.get(key)!;
      const back = storage.getItem(key)!;
      expect(JSON.parse(back)).toEqual(JSON.parse(original));
    }
  });
});

describe("restoreBackup", () => {
  it("não escreve chaves fora do registro", () => {
    const file = createBackup(storage);
    file.data["chave-maliciosa"] = { x: 1 };
    const fresh = memoryStorage();
    const restored = restoreBackup(file, fresh);
    expect(fresh.getItem("chave-maliciosa")).toBeNull();
    expect(restored).toHaveLength(16);
  });
});

describe("assertValidBackup", () => {
  it("aceita um backup do app", () => {
    expect(() => assertValidBackup(createBackup(storage))).not.toThrow();
  });
  it("recusa JSON de outro app, vazio ou sem data", () => {
    expect(() => assertValidBackup({ meta: { app: "Outro" }, data: {} })).toThrow();
    expect(() => assertValidBackup(null)).toThrow();
    expect(() => assertValidBackup({ meta: { app: "Dynamic Notes" } })).toThrow();
  });
});

describe("clearAppData", () => {
  it("apaga só as chaves do app", () => {
    storage.setItem("outra-coisa", "x");
    clearAppData(storage);
    expect(storage.getItem("outra-coisa")).toBe("x");
    for (const key of PERSISTED_KEYS) expect(storage.getItem(key)).toBeNull();
  });
});
