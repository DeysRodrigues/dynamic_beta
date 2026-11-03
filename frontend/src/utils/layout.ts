import type { Layouts } from "react-grid-layout";

export const GRID_COLS = { lg: 4, md: 2, sm: 1 } as const;
const BREAKPOINTS = ["lg", "md", "sm"] as const;

/**
 * Appends a new box to every breakpoint of `layouts`, in place (call it on an immer draft).
 *
 * For each breakpoint it measures how far down every column is filled and puts the box in the
 * shortest one. The box is added with `y: Infinity`, which tells react-grid-layout to drop it
 * at the bottom of that column and let its own compaction pick the real row.
 */
export function addBoxToLayouts(layouts: Layouts, id: string, height: number): void {
  for (const bp of BREAKPOINTS) {
    if (!layouts[bp]) layouts[bp] = [];
    const numCols = GRID_COLS[bp];
    const columnBottom: number[] = new Array(numCols).fill(0);

    for (const item of layouts[bp]) {
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

    layouts[bp].push({ i: id, x: targetX, y: Infinity, w: 1, h: height });
  }
}
