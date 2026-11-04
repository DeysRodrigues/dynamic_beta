// Pure rules of the planning board (no React, no store), so they are easy to test.

export type SlotKind = "free" | "busy";

export interface PlanCard {
  id: string;
  title: string;
  color: string;
}

/** A named group of intervals: a weekday, "Manhã livre", "Sábado de estudo"… whatever the person calls it. */
export interface PlanBlock {
  id: string;
  title: string;
}

export interface PlanSlot {
  id: string;
  blockId: string;
  /** "HH:mm" */
  start: string;
  end: string;
  /** "free" can receive a card; "busy" is time already taken (class, work…). */
  kind: SlotKind;
  /** Name of a busy block. Free slots do not use it. */
  label?: string;
  /** The card placed in this free slot, if any. */
  cardId: string | null;
}

export type NewSlot = Pick<PlanSlot, "blockId" | "start" | "end" | "kind" | "label">;

/** Only used to turn the old day-based data into blocks (see migratePlanBoard). */
export const DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;

export const CARD_COLORS = ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#fb923c"] as const;

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** "08:30" → 510. Returns null when the text is not a valid HH:mm. */
export function toMinutes(time: string): number | null {
  const match = TIME.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

const DAY = 24 * 60;

/**
 * Start and end in minutes on one timeline. An end that is not after the start means the interval
 * runs past midnight, so 22:00–00:00 is 2h and 23:00–01:00 is 2h (the end lands on the next day,
 * above 1440). Null when a time is invalid or start and end are equal (that would be no time at all).
 */
export function slotRange(slot: Pick<PlanSlot, "start" | "end">): { start: number; end: number } | null {
  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  if (start === null || end === null || start === end) return null;
  return { start, end: end > start ? end : end + DAY };
}

/** True when the interval ends on the next day (22:00–00:00, 23:00–01:00). */
export function crossesMidnight(slot: Pick<PlanSlot, "start" | "end">): boolean {
  const range = slotRange(slot);
  return range !== null && range.end >= DAY;
}

export function slotMinutes(slot: Pick<PlanSlot, "start" | "end">): number {
  const range = slotRange(slot);
  return range ? range.end - range.start : 0;
}

/** 60 → "1h", 90 → "1h30", 45 → "45min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}

export function sortSlots<T extends Pick<PlanSlot, "start">>(slots: T[]): T[] {
  return [...slots].sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Why this interval cannot be added, or null when it can. `ignoreId` skips one slot, for edits.
 * Two intervals of the same block may touch (09:00–10:00 and 10:00–11:00) but not overlap. An end
 * earlier than the start runs past midnight (see slotRange); it is compared on that same timeline.
 */
export function validateSlot(existing: PlanSlot[], next: NewSlot, ignoreId?: string): string | null {
  if (toMinutes(next.start) === null || toMinutes(next.end) === null) return "Preencha o início e o fim do intervalo.";
  const range = slotRange(next);
  if (!range) return "O fim não pode ser igual ao início.";

  const clash = existing.find((slot) => {
    if (slot.id === ignoreId || slot.blockId !== next.blockId) return false;
    const other = slotRange(slot);
    return other !== null && range.start < other.end && other.start < range.end;
  });
  return clash ? `Esse horário bate com ${clash.start}–${clash.end}.` : null;
}

/**
 * The first version of the board had fixed weekdays (`day: 0..6`). Turns that into blocks, one per
 * weekday that had intervals, so nothing saved is lost.
 */
export function migratePlanBoard(state: unknown, version: number): unknown {
  if (version >= 2 || typeof state !== "object" || state === null) return state;
  const old = state as { cards?: PlanCard[]; slots?: Array<Omit<PlanSlot, "blockId"> & { day: number }> };
  const oldSlots = old.slots ?? [];
  const days = [...new Set(oldSlots.map((s) => s.day))].sort((a, b) => a - b);
  return {
    cards: old.cards ?? [],
    blocks: days.map((d) => ({ id: `day-${d}`, title: DAY_NAMES[d] ?? `Dia ${d + 1}` })),
    slots: oldSlots.map(({ day, ...rest }) => ({ ...rest, blockId: `day-${day}` })),
  };
}
