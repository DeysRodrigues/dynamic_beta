import { describe, it, expect } from "vitest";
import { toggleTaskAt } from "./markdown";

describe("toggleTaskAt", () => {
  const text = "# Lista\n- [ ] um\n- [x] dois\n- [ ] três";

  it("marca o primeiro", () => expect(toggleTaskAt(text, 0)).toBe("# Lista\n- [x] um\n- [x] dois\n- [ ] três"));
  it("desmarca o do meio", () => expect(toggleTaskAt(text, 1)).toBe("# Lista\n- [ ] um\n- [ ] dois\n- [ ] três"));
  it("marca o último", () => expect(toggleTaskAt(text, 2)).toBe("# Lista\n- [ ] um\n- [x] dois\n- [x] três"));
  it("índice fora do alcance não muda nada", () => expect(toggleTaskAt(text, 9)).toBe(text));
  it("aceita * e + e listas numeradas", () => {
    expect(toggleTaskAt("* [ ] a\n+ [ ] b\n1. [ ] c", 2)).toBe("* [ ] a\n+ [ ] b\n1. [x] c");
  });
  it("aceita item aninhado com recuo", () => {
    expect(toggleTaskAt("- [ ] a\n  - [ ] b", 1)).toBe("- [ ] a\n  - [x] b");
  });
  it("ignora o que está dentro de bloco de código", () => {
    const t = "```\n- [ ] não é tarefa\n```\n- [ ] é tarefa";
    expect(toggleTaskAt(t, 0)).toBe("```\n- [ ] não é tarefa\n```\n- [x] é tarefa");
  });
  it("não confunde colchetes no meio do texto", () => {
    const t = "veja [ ] isso\n- [ ] item";
    expect(toggleTaskAt(t, 0)).toBe("veja [ ] isso\n- [x] item");
  });
  it("não mexe em texto sem tarefas", () => expect(toggleTaskAt("só texto", 0)).toBe("só texto"));
});
