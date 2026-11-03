import { describe, it, expect } from "vitest";
import { loadConfig } from "../src/config.js";

const valid = { DATABASE_URL: "postgres://u:p@db:5432/x", JWT_SECRET: "x".repeat(32) };

describe("loadConfig", () => {
  it("lê a configuração mínima e preenche os padrões", () => {
    const config = loadConfig(valid);
    expect(config.PORT).toBe(3000);
    expect(config.ALLOW_REGISTRATION).toBe(true);
    expect(config.CORS_ORIGINS).toBe("*");
  });

  it("recusa subir sem JWT_SECRET, e diz isso com clareza", () => {
    expect(() => loadConfig({ DATABASE_URL: valid.DATABASE_URL })).toThrow(/JWT_SECRET/);
  });

  it("recusa um JWT_SECRET curto demais", () => {
    expect(() => loadConfig({ ...valid, JWT_SECRET: "curto" })).toThrow(/at least 32/);
  });

  it("recusa sem DATABASE_URL", () => {
    expect(() => loadConfig({ JWT_SECRET: valid.JWT_SECRET })).toThrow(/DATABASE_URL/);
  });

  it("lista todos os problemas de uma vez", () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL[\s\S]*JWT_SECRET/);
  });

  it("entende ALLOW_REGISTRATION como booleano", () => {
    expect(loadConfig({ ...valid, ALLOW_REGISTRATION: "false" }).ALLOW_REGISTRATION).toBe(false);
    expect(loadConfig({ ...valid, ALLOW_REGISTRATION: "1" }).ALLOW_REGISTRATION).toBe(true);
    expect(() => loadConfig({ ...valid, ALLOW_REGISTRATION: "talvez" })).toThrow();
  });

  it("recusa porta inválida", () => {
    expect(() => loadConfig({ ...valid, PORT: "99999" })).toThrow(/PORT/);
  });
});
