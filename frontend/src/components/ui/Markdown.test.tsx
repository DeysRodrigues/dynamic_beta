import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  it("renderiza títulos, negrito, itálico e riscado", () => {
    render(<Markdown>{"# Título\n\n**forte**, *itálico* e ~~riscado~~"}</Markdown>);
    expect(screen.getByRole("heading", { level: 1, name: "Título" })).toBeInTheDocument();
    expect(screen.getByText("forte").tagName).toBe("STRONG");
    expect(screen.getByText("itálico").tagName).toBe("EM");
    expect(screen.getByText("riscado").tagName).toBe("DEL");
  });

  it("renderiza listas", () => {
    render(<Markdown>{"- a\n- b\n\n1. um\n2. dois"}</Markdown>);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getAllByRole("list")).toHaveLength(2);
  });

  it("renderiza tabela GFM", () => {
    render(<Markdown>{"| a | b |\n|---|---|\n| 1 | 2 |"}</Markdown>);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByText("2").tagName).toBe("TD");
  });

  it("código inline e bloco", () => {
    render(<Markdown>{"use `npm test`\n\n```ts\nconst a = 1;\n```"}</Markdown>);
    expect(screen.getByText("npm test").closest("pre")).toBeNull();
    expect(screen.getByText("const a = 1;").closest("pre")).not.toBeNull();
  });

  it("links abrem em outra aba, sem referrer de opener", () => {
    render(<Markdown>{"[site](https://example.com)"}</Markdown>);
    const a = screen.getByRole("link", { name: "site" });
    expect(a).toHaveAttribute("href", "https://example.com");
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  });

  it("não executa nem renderiza HTML cru", () => {
    const { container } = render(<Markdown>{'<script>window.x=1</script><img src=x onerror="alert(1)"> oi'}</Markdown>);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect((window as unknown as { x?: number }).x).toBeUndefined();
  });

  it("descarta link com esquema perigoso", () => {
    render(<Markdown>{"[clique](javascript:alert(1))"}</Markdown>);
    const a = screen.queryByRole("link", { name: "clique" });
    expect(a?.getAttribute("href") ?? "").not.toContain("javascript:");
  });

  it("checklist aparece como checkbox marcado ou não", () => {
    render(<Markdown>{"- [ ] a\n- [x] b"}</Markdown>);
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes.map((b) => b.checked)).toEqual([false, true]);
  });

  it("sem onToggleTask o checkbox não responde ao clique", async () => {
    render(<Markdown>{"- [ ] a"}</Markdown>);
    await userEvent.click(screen.getByRole("checkbox"));
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });

  it("com onToggleTask informa a posição do checkbox clicado", async () => {
    const onToggle = vi.fn();
    render(<Markdown onToggleTask={onToggle}>{"- [ ] a\n- [ ] b\n- [x] c"}</Markdown>);
    await userEvent.click(screen.getAllByRole("checkbox")[2]);
    await userEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onToggle.mock.calls.map((c) => c[0])).toEqual([2, 0]);
  });

  it("texto vazio não quebra", () => {
    const { container } = render(<Markdown>{""}</Markdown>);
    expect(container.textContent).toBe("");
  });
});
