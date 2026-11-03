import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBoxContentStore, readContent } from "./useBoxContentStore";
import { notepadContentSchema } from "@/widgets/schemas/notepad";
import { bookTrackerContentSchema } from "@/widgets/schemas/books";

beforeEach(() => {
  useBoxContentStore.setState({ contents: {} });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getBoxContent", () => {
  it("devolve objeto vazio para box sem conteúdo", () => {
    expect(useBoxContentStore.getState().getBoxContent("n-1")).toEqual({});
  });

  it("com schema, devolve o conteúdo válido", () => {
    useBoxContentStore.setState({ contents: { "n-1": { text: "oi" } } });
    expect(useBoxContentStore.getState().getBoxContent("n-1", notepadContentSchema)).toEqual({ text: "oi" });
  });

  it("com schema, conteúdo corrompido cai no padrão (vazio) sem quebrar", () => {
    useBoxContentStore.setState({ contents: { "n-1": { text: 123 } } });
    expect(useBoxContentStore.getState().getBoxContent("n-1", notepadContentSchema)).toEqual({});
  });

  it("conteúdo que não é objeto também cai no padrão", () => {
    useBoxContentStore.setState({ contents: { "b-1": "lixo" } });
    expect(useBoxContentStore.getState().getBoxContent("b-1", bookTrackerContentSchema)).toEqual({});
  });

  it("sem schema devolve o que está salvo", () => {
    useBoxContentStore.setState({ contents: { "x-1": { qualquer: 1 } } });
    expect(useBoxContentStore.getState().getBoxContent("x-1")).toEqual({ qualquer: 1 });
  });
});

describe("setBoxContent", () => {
  it("mescla com o que já existe", () => {
    const { setBoxContent } = useBoxContentStore.getState();
    setBoxContent("b-1", { books: [] }, bookTrackerContentSchema);
    setBoxContent("b-1", { settings: { pageStep: 5 } }, bookTrackerContentSchema);
    expect(useBoxContentStore.getState().contents["b-1"]).toEqual({ books: [], settings: { pageStep: 5 } });
  });

  it("recusa escrita inválida e mantém o dado anterior", () => {
    const { setBoxContent } = useBoxContentStore.getState();
    setBoxContent("n-1", { text: "bom" }, notepadContentSchema);
    setBoxContent("n-1", { text: 999 }, notepadContentSchema);
    expect(useBoxContentStore.getState().contents["n-1"]).toEqual({ text: "bom" });
  });

  it("sem schema grava sem validar (widgets ainda não migrados)", () => {
    useBoxContentStore.getState().setBoxContent("x-1", { qualquer: 1 });
    expect(useBoxContentStore.getState().contents["x-1"]).toEqual({ qualquer: 1 });
  });
});

describe("readContent", () => {
  it("funciona fora da store, para quem lê direto do estado", () => {
    expect(readContent({ text: "a" }, notepadContentSchema)).toEqual({ text: "a" });
    expect(readContent(undefined, notepadContentSchema)).toEqual({});
    expect(readContent({ text: [] }, notepadContentSchema)).toEqual({});
  });
});
