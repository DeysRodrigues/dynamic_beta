import { describe, it, expect } from "vitest";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { themeThumbnail } from "./themeImages";
import { wallpaperThemes, readySetups } from "@/data/themeItems";

const publicDir = resolve(__dirname, "../../public");

describe("themeThumbnail", () => {
  it("troca o png do tema pela miniatura webp", () => {
    expect(themeThumbnail("/images-themes/cat-pile.png")).toBe("/images-themes/thumbs/cat-pile.webp");
    expect(themeThumbnail("/images-themes/One-Piece.png")).toBe("/images-themes/thumbs/One-Piece.webp");
  });
  it("não mexe no que não é papel de parede embutido", () => {
    expect(themeThumbnail("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
    expect(themeThumbnail("https://exemplo.com/a.png")).toBe("https://exemplo.com/a.png");
    expect(themeThumbnail("/outra-pasta/a.png")).toBe("/outra-pasta/a.png");
  });
  it("vazio vira null", () => {
    expect(themeThumbnail(null)).toBeNull();
    expect(themeThumbnail(undefined)).toBeNull();
    expect(themeThumbnail("")).toBeNull();
  });
});

describe("miniaturas dos temas", () => {
  const images = new Set(
    [...wallpaperThemes.map((t) => t.theme.customImage), ...readySetups.map((s) => s.theme.customImage)].filter(
      (src): src is string => !!src && src.startsWith("/images-themes/")
    )
  );

  it("há imagens de tema para conferir", () => {
    expect(images.size).toBeGreaterThan(10);
  });

  it.each([...images])("%s tem a imagem original e uma miniatura leve", (src) => {
    expect(existsSync(resolve(publicDir, "." + src))).toBe(true);

    const thumb = themeThumbnail(src)!;
    const file = resolve(publicDir, "." + thumb);
    expect(existsSync(file), `falta ${thumb}; rode scripts/make-theme-thumbs.sh`).toBe(true);
    expect(statSync(file).size).toBeLessThan(100 * 1024);
  });
});
