/**
 * The pixel art of the Pixel Garden, drawn by code instead of by hand.
 *
 * A sprite is a grid of palette keys (`null` is empty). Leaves are drawn as shaded shapes with a
 * vein, pots as shaded trapezoids, and a dark outline is added around everything at the end, which
 * is what gives the art its cartoon look. Because it is only data, it can be tested and tuned.
 */

export type Pixel = string | null;
export type Grid = Pixel[][];

export const PALETTE: Record<string, string> = {
  // leaves, light to dark, and their outline
  L1: "#dff08a", L2: "#b4d94c", L3: "#7fb83e", L4: "#4f8f36", L5: "#2f6a30", LO: "#1f4a2a",
  // white pot
  W1: "#fbfaf4", W2: "#dedfe2", W3: "#aeb3be", PO: "#383c4b",
  // grey-blue pot
  B1: "#c9d4e0", B2: "#9aabbf", B3: "#6c7d95",
  // terracotta pot
  T1: "#e39a80", T2: "#bf6e5e", T3: "#8c4b47", TO: "#4a2a2d",
  // soil
  S1: "#6b4a3a", S2: "#46302a",
  // flower
  F1: "#ff9d3a", F2: "#ffd84a", F3: "#4d8df0",
  // card
  C0: "#f3ddcc", C1: "#e5c6b1", CO: "#7e5d54",
  // sparkle
  K1: "#fff6c2",
};

export const SPRITE_W = 40;
export const SPRITE_H = 44;
export const SCENE_W = 46;
export const SCENE_H = 52;

/** The plant of each growth stage, in order. Stage 0 is an empty pot. */
export const STAGES = 5;

function blank(w: number, h: number): Grid {
  return Array.from({ length: h }, () => Array<Pixel>(w).fill(null));
}

function put(grid: Grid, x: number, y: number, key: Pixel) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (py < 0 || py >= grid.length || px < 0 || px >= grid[0].length) return;
  grid[py][px] = key;
}

function line(grid: Grid, x0: number, y0: number, x1: number, y1: number, key: string) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) put(grid, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, key);
}

interface LeafOptions {
  /** Where the stem starts. */
  x: number;
  y: number;
  /** Degrees; 0 points straight up, positive leans right. */
  angle: number;
  /** How many degrees the leaf turns, by the tip, from where it started (positive bends right). */
  bend?: number;
  /** Length of the blade and half of its widest part, in pixels. */
  len: number;
  wid: number;
  /** Length of the bare stem before the blade starts. */
  stem?: number;
  /** Cut notches along the edges, like a monstera. */
  slits?: boolean;
}

/**
 * Draws one leaf along a curve: a thin stem, then a blade whose width swells and narrows again,
 * shaded from the upper left, with a light vein down the middle. The leaf is swept along its
 * curve in small steps, so it can arch the way a real one does.
 */
function leaf(grid: Grid, o: LeafOptions) {
  const stem = o.stem ?? 0;
  const total = stem + o.len;
  const bend = o.bend ?? 0;
  const STEP = 0.3;

  let x = o.x;
  let y = o.y;

  for (let s = 0; s <= total; s += STEP) {
    const angle = ((o.angle + bend * (s / total)) * Math.PI) / 180;
    const axis = { x: Math.sin(angle), y: -Math.cos(angle) };
    const side = { x: Math.cos(angle), y: Math.sin(angle) };

    if (s < stem) {
      put(grid, x, y, "L4");
    } else {
      const t = (s - stem) / o.len;
      const half = o.wid * Math.sin(Math.PI * Math.pow(t, 0.7));

      for (let v = -half; v <= half + 0.001; v += 0.45) {
        const across = half === 0 ? 0 : v / half;

        // notches: wedges cut from the edge inward, wider at the edge
        if (o.slits && Math.abs(across) > 0.4 && t > 0.18 && t < 0.9) {
          const spread = 0.04 + 0.1 * (Math.abs(across) - 0.4);
          if (Math.abs(((t * 4.2) % 1) - 0.5) < spread * 4.2) continue;
        }

        // The side facing the upper-left light is brighter.
        const facing = Math.sign(v) * (side.x * -0.7 + side.y * -0.7) * Math.abs(across);
        let key = "L3";
        if (facing > 0.3) key = "L2";
        else if (facing < -0.3) key = "L4";
        if (Math.abs(v) < 0.5 && t > 0.06 && t < 0.9) key = facing < -0.05 ? "L3" : "L1";
        if (t > 0.9 && key === "L3") key = "L2";

        put(grid, x + side.x * v, y + side.y * v, key);
      }
    }

    x += axis.x * STEP;
    y += axis.y * STEP;
  }
}

type Shades = [light: string, mid: string, dark: string];
const POTS: Record<"white" | "blue" | "clay", Shades> = {
  white: ["W1", "W2", "W3"],
  blue: ["B1", "B2", "B3"],
  clay: ["T1", "T2", "T3"],
};

/** A pot with a rim, a body that narrows toward the bottom and a bit of soil on top. */
function pot(grid: Grid, cx: number, top: number, kind: keyof typeof POTS, w = 14, h = 9) {
  const [light, mid, dark] = POTS[kind];
  const left = cx - w / 2 - 1;
  const right = cx + w / 2;

  // soil, visible inside the rim
  for (let x = left + 2; x <= right - 2; x++) put(grid, x, top, x < cx ? "S1" : "S2");

  // rim: two rows a little wider than the body
  for (let x = left; x <= right; x++) {
    put(grid, x, top + 1, x <= left + 1 ? light : x >= right - 1 ? dark : mid);
    put(grid, x, top + 2, x >= right - 1 ? dark : light);
  }

  // body
  for (let row = 0; row < h - 2; row++) {
    const inset = Math.floor((row + 1) / 2);
    for (let x = left + 1 + inset; x <= right - 1 - inset; x++) {
      let key = mid;
      if (x <= left + 2 + inset) key = light;
      else if (x >= right - 2 - inset) key = dark;
      put(grid, x, top + 3 + row, key);
    }
  }
}

/** Adds the dark outline: every empty pixel next to a drawn one takes the color of its neighbour's family. */
function outline(grid: Grid) {
  const h = grid.length;
  const w = grid[0].length;
  const edge: [number, number, string][] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] !== null) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = grid[y + dy]?.[x + dx];
        if (!n || n.endsWith("O")) continue;
        const family = n[0];
        edge.push([x, y, family === "T" ? "TO" : family === "L" || family === "F" ? "LO" : "PO"]);
        break;
      }
    }
  }
  for (const [x, y, key] of edge) grid[y][x] = key;
}

const CX = 20; // the plant's center line
const POT_TOP = 34;

function drawStage(stage: number): Grid {
  const g = blank(SPRITE_W, SPRITE_H);
  const bx = CX;
  const by = POT_TOP;

  switch (stage) {
    case 0: {
      pot(g, CX, POT_TOP, "white");
      // a small mound of fresh soil
      for (let x = CX - 4; x <= CX + 4; x++) put(g, x, POT_TOP - 1, x < CX ? "S1" : "S2");
      for (let x = CX - 2; x <= CX + 2; x++) put(g, x, POT_TOP - 2, "S1");
      break;
    }
    case 1: {
      pot(g, CX, POT_TOP, "white");
      leaf(g, { x: bx, y: by, angle: -14, bend: -55, stem: 4, len: 7, wid: 2.4 });
      leaf(g, { x: bx, y: by, angle: 14, bend: 55, stem: 5, len: 7, wid: 2.4 });
      break;
    }
    case 2: {
      pot(g, CX, POT_TOP, "clay");
      leaf(g, { x: bx, y: by, angle: -36, bend: -50, stem: 6, len: 9, wid: 3.4 });
      leaf(g, { x: bx, y: by, angle: 36, bend: 50, stem: 6, len: 9, wid: 3.4 });
      leaf(g, { x: bx, y: by, angle: -14, bend: -34, stem: 10, len: 9, wid: 3.6 });
      leaf(g, { x: bx, y: by, angle: 14, bend: 30, stem: 11, len: 9, wid: 3.6 });
      leaf(g, { x: bx, y: by, angle: 2, bend: 8, stem: 15, len: 8, wid: 3.2 });
      break;
    }
    case 3: {
      pot(g, CX, POT_TOP, "blue");
      leaf(g, { x: bx, y: by, angle: -46, bend: -62, stem: 5, len: 12, wid: 5, slits: true });
      leaf(g, { x: bx, y: by, angle: 46, bend: 62, stem: 5, len: 12, wid: 5, slits: true });
      leaf(g, { x: bx, y: by, angle: -20, bend: -40, stem: 11, len: 12, wid: 5, slits: true });
      leaf(g, { x: bx, y: by, angle: 22, bend: 40, stem: 13, len: 11, wid: 4.8, slits: true });
      leaf(g, { x: bx, y: by, angle: 0, bend: 6, stem: 18, len: 8, wid: 3.4 });
      break;
    }
    default: {
      pot(g, CX, POT_TOP, "white");
      // the flower: a thin stem rising to a bird-of-paradise crest, behind the leaves
      line(g, bx + 1, by, bx + 10, by - 20, "L5");
      for (const [dx, dy, key] of [
        [0, 0, "F1"], [1, -1, "F1"], [2, -2, "F2"], [3, -2, "F1"], [1, 0, "F3"],
        [-1, 0, "F1"], [0, -1, "F2"], [2, -1, "F1"], [3, -1, "F2"],
      ] as const)
        put(g, bx + 10 + dx, by - 20 + dy, key);
      leaf(g, { x: bx, y: by, angle: -34, bend: -26, stem: 6, len: 18, wid: 2.9 });
      leaf(g, { x: bx, y: by, angle: 33, bend: 24, stem: 6, len: 17, wid: 2.9 });
      leaf(g, { x: bx, y: by, angle: -11, bend: -9, stem: 9, len: 23, wid: 3.1 });
      leaf(g, { x: bx, y: by, angle: 11, bend: 8, stem: 10, len: 21, wid: 3.1 });
      break;
    }
  }

  outline(g);
  return g;
}

/** The plant alone, on a transparent background. */
export function renderSprite(stage: number): Grid {
  return drawStage(Math.max(0, Math.min(STAGES - 1, stage)));
}

/** The plant on its beige card, as shown in the widget. */
export function renderScene(stage: number): Grid {
  const scene = blank(SCENE_W, SCENE_H);

  for (let y = 0; y < SCENE_H; y++) {
    for (let x = 0; x < SCENE_W; x++) {
      const border = x === 0 || y === 0 || x === SCENE_W - 1 || y === SCENE_H - 1;
      const corner = (x === 0 || x === SCENE_W - 1) && (y === 0 || y === SCENE_H - 1);
      if (corner) continue;
      scene[y][x] = border ? "CO" : y > SCENE_H - 7 ? "C1" : "C0";
    }
  }

  const sprite = renderSprite(stage);
  const ox = Math.floor((SCENE_W - SPRITE_W) / 2);
  const oy = SCENE_H - SPRITE_H - 4;
  for (let y = 0; y < SPRITE_H; y++)
    for (let x = 0; x < SPRITE_W; x++) if (sprite[y][x]) scene[oy + y][ox + x] = sprite[y][x];

  return scene;
}

/** How far the plant has grown, from the tasks done today: 0, 1-2, 3-4, 5-7 and 8 or more. */
export function gardenStage(completedToday: number): number {
  if (completedToday === 0) return 0;
  if (completedToday < 3) return 1;
  if (completedToday < 5) return 2;
  if (completedToday < 8) return 3;
  return 4;
}

export interface Run {
  x: number;
  y: number;
  width: number;
  key: string;
}

/** Merges neighbours of the same color in a row, so the SVG has a few hundred rects, not thousands. */
export function toRuns(grid: Grid): Run[] {
  const runs: Run[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const key = row[x];
      if (!key) { x++; continue; }
      let end = x;
      while (end + 1 < row.length && row[end + 1] === key) end++;
      runs.push({ x, y, width: end - x + 1, key });
      x = end + 1;
    }
  });
  return runs;
}
