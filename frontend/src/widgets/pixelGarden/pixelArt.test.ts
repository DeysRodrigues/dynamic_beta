import { describe, it, expect } from "vitest";
import { PALETTE, STAGES, SPRITE_H, SPRITE_W, SCENE_H, SCENE_W, gardenStage, renderScene, renderSprite, toRuns } from "./pixelArt";

const count = (grid: (string | null)[][], test: (key: string) => boolean) =>
  grid.flat().filter((k): k is string => !!k && test(k)).length;
const isLeaf = (k: string) => /^L[1-5]$/.test(k);

describe("o desenho do jardim", () => {
  const sprites = Array.from({ length: STAGES }, (_, s) => renderSprite(s));

  it("tem 5 estágios, todos do mesmo tamanho", () => {
    expect(STAGES).toBe(5);
    for (const sprite of sprites) {
      expect(sprite).toHaveLength(SPRITE_H);
      expect(sprite.every((row) => row.length === SPRITE_W)).toBe(true);
    }
  });

  it("só usa cores da paleta", () => {
    for (const sprite of sprites) for (const key of sprite.flat()) if (key) expect(PALETTE[key], key).toBeDefined();
  });

  it("o vaso vazio não tem folha, e a planta cresce a cada estágio", () => {
    const leaves = sprites.map((s) => count(s, isLeaf));
    expect(leaves[0]).toBe(0);
    for (let i = 1; i < leaves.length; i++) expect(leaves[i], `estágio ${i}`).toBeGreaterThan(leaves[i - 1]);
  });

  it("o vaso é sempre o marrom de barro, em todos os estágios", () => {
    for (const [stage, sprite] of sprites.entries()) {
      expect(count(sprite, (k) => /^T[1-3]$/.test(k)), `estágio ${stage}`).toBeGreaterThan(20);
      expect(count(sprite, (k) => /^[WB][1-3]$/.test(k)), `estágio ${stage}`).toBe(0);
    }
    const pots = sprites.map((s) => s.slice(36).map((row) => row.join(",")).join("|"));
    expect(new Set(pots).size).toBe(1); // o corpo do vaso (abaixo da terra e das hastes) é idêntico
  });

  it("o desenho todo tem contorno: nenhuma folha encosta no vazio", () => {
    for (const sprite of sprites) {
      sprite.forEach((row, y) =>
        row.forEach((key, x) => {
          if (!key || !isLeaf(key)) return;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            expect(sprite[y + dy]?.[x + dx], `folha solta em ${x},${y}`).not.toBeNull();
          }
        })
      );
    }
  });

  it("a planta cabe no desenho, sem encostar na borda", () => {
    for (const sprite of sprites) {
      const filled = sprite.flatMap((row, y) => row.map((k, x) => (k ? { x, y } : null))).filter(Boolean) as { x: number; y: number }[];
      expect(Math.min(...filled.map((p) => p.x))).toBeGreaterThan(0);
      expect(Math.max(...filled.map((p) => p.x))).toBeLessThan(SPRITE_W - 1);
      expect(Math.min(...filled.map((p) => p.y))).toBeGreaterThan(0);
    }
  });

  it("a planta lendária tem flor", () => {
    expect(count(sprites[4], (k) => k.startsWith("F"))).toBeGreaterThan(3);
    expect(count(sprites[3], (k) => k.startsWith("F"))).toBe(0);
  });

  it("é determinístico: desenhar duas vezes dá o mesmo", () => {
    expect(renderSprite(3)).toEqual(renderSprite(3));
  });

  it("estágio fora do intervalo é limitado aos extremos", () => {
    expect(renderSprite(-4)).toEqual(renderSprite(0));
    expect(renderSprite(99)).toEqual(renderSprite(4));
  });
});

describe("a cena", () => {
  it("é um cartão bege com moldura, com a planta dentro", () => {
    const scene = renderScene(2);
    expect(scene).toHaveLength(SCENE_H);
    expect(scene[0].length).toBe(SCENE_W);
    expect(scene[0][1]).toBe("CO");
    expect(scene[0][0]).toBeNull(); // cantos arredondados
    expect(scene[10][1 + 1]).toBe("C0");
    expect(count(scene, isLeaf)).toBeGreaterThan(0);
  });
});

describe("toRuns", () => {
  it("junta pixels vizinhos da mesma cor numa linha, sem perder nenhum", () => {
    const grid = [["L1", "L1", "L2", null, "L2"], [null, null, null, null, null]];
    expect(toRuns(grid)).toEqual([
      { x: 0, y: 0, width: 2, key: "L1" },
      { x: 2, y: 0, width: 1, key: "L2" },
      { x: 4, y: 0, width: 1, key: "L2" },
    ]);
  });
  it("cobre exatamente os pixels pintados da cena", () => {
    const scene = renderScene(4);
    const painted = scene.flat().filter(Boolean).length;
    expect(toRuns(scene).reduce((sum, r) => sum + r.width, 0)).toBe(painted);
    expect(toRuns(scene).length).toBeLessThan(painted / 2);
  });
});

describe("gardenStage", () => {
  it.each([[0, 0], [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [7, 3], [8, 4], [20, 4]])("%i tarefas -> estágio %i", (done, stage) => {
    expect(gardenStage(done)).toBe(stage);
  });
});
