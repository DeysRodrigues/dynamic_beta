import { describe, it, expect } from "vitest";
import { isDefaultValue } from "./hydration";
import { PERSISTED } from "./registry";
import { useTagStore } from "@/store/useTagStore";
import { useThemeStore } from "@/store/useThemeStore";

describe("isDefaultValue", () => {
  it("reconhece o que a store grava quando ainda está como começou", () => {
    expect(isDefaultValue(PERSISTED.tags.key, { state: { tags: [] }, version: 1 })).toBe(true);
  });

  it("não considera padrão o que a pessoa mexeu", () => {
    expect(isDefaultValue(PERSISTED.tags.key, { state: { tags: ["faculdade"] }, version: 1 })).toBe(false);
  });

  it("ignora a ordem das chaves", () => {
    const initial = JSON.parse(JSON.stringify(useThemeStore.getInitialState()));
    const reversed = Object.fromEntries(Object.entries(initial).reverse());
    expect(isDefaultValue(PERSISTED.theme.key, { version: 1, state: reversed })).toBe(true);
  });

  it("uma mudança em um campo já não é o padrão", () => {
    const initial = JSON.parse(JSON.stringify(useThemeStore.getInitialState()));
    expect(isDefaultValue(PERSISTED.theme.key, { state: { ...initial, boxOpacity: 0.123 }, version: 1 })).toBe(false);
  });

  it("a versão do dado conta: outra versão não é o padrão de hoje", () => {
    expect(isDefaultValue(PERSISTED.tags.key, { state: { tags: [] }, version: 99 })).toBe(false);
  });

  it("o contador de água: 0 é o padrão", () => {
    expect(isDefaultValue(PERSISTED.waterCups.key, 0)).toBe(true);
    expect(isDefaultValue(PERSISTED.waterCups.key, 3)).toBe(false);
  });

  it("chave desconhecida nunca é padrão", () => {
    expect(isDefaultValue("nao-existe", { state: {} })).toBe(false);
  });

  it("não depende do estado atual da store, só do inicial", () => {
    useTagStore.setState({ tags: ["mexi"] });
    expect(isDefaultValue(PERSISTED.tags.key, { state: { tags: [] }, version: 1 })).toBe(true);
    useTagStore.setState({ tags: [] });
  });
});
