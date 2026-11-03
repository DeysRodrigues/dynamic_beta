import type { Layout, Layouts } from "react-grid-layout";
import type { BoxRef } from "@/types/Box";

export const GRID_COLS = { lg: 4, md: 2, sm: 1 } as const;
const BREAKPOINTS = ["lg", "md", "sm"] as const;

/**
 * Puts a new box at the bottom of the shortest column of one breakpoint.
 *
 * It measures how far down every column is filled. With `finiteY` the box gets that exact row;
 * otherwise `y: Infinity`, which tells react-grid-layout to drop it at the bottom and let its
 * own compaction pick the real row.
 */
function placeBox(items: Layout[], numCols: number, id: string, height: number, finiteY: boolean): Layout {
  const columnBottom: number[] = new Array(numCols).fill(0);

  for (const item of items) {
    const bottom = (item.y || 0) + (item.h || 1);
    const start = item.x || 0;
    for (let col = start; col < start + (item.w || 1) && col < numCols; col++) {
      if (bottom > columnBottom[col]) columnBottom[col] = bottom;
    }
  }

  let targetX = 0;
  let shortest = Infinity;
  for (let col = 0; col < numCols; col++) {
    if (columnBottom[col] < shortest) {
      shortest = columnBottom[col];
      targetX = col;
    }
  }

  return { i: id, x: targetX, y: finiteY ? shortest : Infinity, w: 1, h: height };
}

/** Appends a new box to every breakpoint of `layouts`, in place (call it on an immer draft). */
export function addBoxToLayouts(layouts: Layouts, id: string, height: number): void {
  for (const bp of BREAKPOINTS) {
    if (!layouts[bp]) layouts[bp] = [];
    layouts[bp].push(placeBox(layouts[bp], GRID_COLS[bp], id, height, false));
  }
}

/**
 * Makes `layouts` match `boxes`: every box gets a position and a height on every breakpoint, and
 * layout entries of boxes that no longer exist are dropped. Existing entries are kept as they
 * are, so a layout the user arranged is not touched. Returns a new object.
 *
 * A box with no entry would be drawn by the grid at its minimum size and piled up in the
 * corner, which is what a project looked like when it was created with empty layouts.
 */
export function ensureLayouts(
  boxes: readonly BoxRef[],
  layouts: Layouts | undefined,
  heightOf: (type: string) => number
): Layouts {
  const ids = new Set(boxes.map((box) => box.id));
  const result: Layouts = {};

  // Keep every breakpoint that was there, even the ones this app does not edit.
  for (const [bp, items] of Object.entries(layouts ?? {})) {
    result[bp] = (items ?? []).filter((item) => ids.has(item.i)).map((item) => ({ ...item }));
  }

  for (const bp of BREAKPOINTS) {
    const items = (result[bp] ??= []);
    for (const box of boxes) {
      if (items.some((item) => item.i === box.id)) continue;
      items.push(placeBox(items, GRID_COLS[bp], box.id, heightOf(box.type), true));
    }
  }

  return result;
}

export interface PackItem {
  id: string;
  w: number;
  h: number;
}

/**
 * Lays boxes out on every breakpoint without any overlap, in the order given.
 *
 * Each box goes to the spot where it sits highest: for every column it could start at, it takes
 * the lowest point of the columns it would cover, and picks the start with the smallest one
 * (leftmost on a tie). Widths are cut down to the breakpoint's column count, so a box 2 wide
 * becomes 1 wide on a phone. Used to describe a ready-made setup by sizes alone.
 */
export function packLayouts(items: readonly PackItem[]): Layouts {
  const result: Layouts = {};

  for (const bp of BREAKPOINTS) {
    const cols = GRID_COLS[bp];
    const heights: number[] = new Array(cols).fill(0);

    result[bp] = items.map((item) => {
      const w = Math.min(item.w, cols);
      let bestX = 0;
      let bestY = Infinity;

      for (let x = 0; x <= cols - w; x++) {
        const y = Math.max(...heights.slice(x, x + w));
        if (y < bestY) {
          bestY = y;
          bestX = x;
        }
      }

      for (let col = bestX; col < bestX + w; col++) heights[col] = bestY + item.h;
      return { i: item.id, x: bestX, y: bestY, w, h: item.h };
    });
  }

  return result;
}
