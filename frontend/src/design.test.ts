import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The look of the app is filled surfaces, not outlines: no borders, no dashed or dotted
 * frames, no divider lines. Focus rings stay, because they are how a keyboard user sees where
 * they are. This test keeps new code from bringing the lines back.
 */
const srcDir = resolve(__dirname);

// Where a line is part of the content or of a drawing rather than of the interface.
const ALLOWED: Record<string, string> = {
  "widgets/SnakeWidget.tsx": "the game board frame",
  "components/ui/Markdown.tsx": "the horizontal rule a note asks for with ---",
  "components/layout/boxes/CozyLibraryBox.tsx": "the spines drawn on the shelf books",
};

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.tsx$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path] : [];
  });
}

const BORDER = /(?<![\w:/-])(?:border(?:-[trblxy])?(?:-(?:[0-9]+|dashed|dotted|white|black|current|gray|slate|zinc|primary|indigo|blue|red|green|amber|purple|\[[^\]\s]+\]))?|divide-[xy])(?![\w-])/;
const DIVIDER = /<hr\b|\b(?:w|h)-px\b/;

describe("a interface não usa linhas", () => {
  const all = files(srcDir).map((path) => ({ path, rel: path.slice(srcDir.length + 1).replaceAll("\\", "/") }));

  it("há arquivos para conferir", () => expect(all.length).toBeGreaterThan(50));

  it("nenhum arquivo da interface tem borda, divisor, tracejado ou pontilhado", () => {
    const offenders: string[] = [];

    for (const { path, rel } of all) {
      const source = readFileSync(path, "utf8");
      if (/border-(dashed|dotted)|\bdashed\b|\bdotted\b/.test(source)) offenders.push(`${rel}: dashed/dotted`);
      if (rel in ALLOWED) continue;

      source.split("\n").forEach((text, i) => {
        if (/^\s*(\/\/|\{\/\*|\*)/.test(text)) return;
        const clean = text.replace(/\b(border-box|border-collapse|focus[\w-]*:border\S*)\b/g, "");
        if (BORDER.test(clean) || DIVIDER.test(text)) offenders.push(`${rel}:${i + 1}: ${text.trim().slice(0, 90)}`);
      });
    }

    expect(offenders).toEqual([]);
  });
});
