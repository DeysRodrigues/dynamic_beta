import type { BoxRef } from "@/types/Box";

/** The only place a box id is generated. */
export function createBox(type: string): BoxRef {
  return { id: `${type}-${crypto.randomUUID().slice(0, 8)}`, type };
}

/**
 * Rebuilds a box from a bare id, for data written before boxes carried their type: saved
 * dashboards, layout templates and theme presets. Ids look like `<type>-<suffix>`, or are just
 * `<type>` for the default boxes. New code should never need this.
 */
export function boxFromLegacyId(id: string): BoxRef {
  const dash = id.indexOf("-");
  return { id, type: dash === -1 ? id : id.slice(0, dash) };
}

export function boxIds(boxes: readonly BoxRef[]): string[] {
  return boxes.map((box) => box.id);
}
