import { describe, it, expect } from "vitest";
import { createBox, boxFromLegacyId, boxIds } from "./BoxFactory";

describe("createBox", () => {
  it("gera id com o tipo na frente e guarda o tipo como campo", () => {
    const box = createBox("notepad");
    expect(box.type).toBe("notepad");
    expect(box.id).toMatch(/^notepad-[0-9a-f]{8}$/);
  });
  it("não repete id", () => {
    expect(createBox("tasks").id).not.toBe(createBox("tasks").id);
  });
  it("aceita tipo com underscore", () => {
    expect(createBox("three_frogs").id.startsWith("three_frogs-")).toBe(true);
  });
});

describe("boxFromLegacyId", () => {
  it.each([
    ["tasks", "tasks"],
    ["notepad-k3j2h1", "notepad"],
    ["embedded-lofi-cat", "embedded"],
    ["three_frogs-ab12", "three_frogs"],
  ])("%s -> %s", (id, type) => {
    expect(boxFromLegacyId(id)).toEqual({ id, type });
  });
});

describe("boxIds", () => {
  it("devolve só os ids", () => {
    expect(boxIds([createBox("a"), { id: "b-1", type: "b" }]).at(-1)).toBe("b-1");
  });
});
