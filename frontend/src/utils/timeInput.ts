// Turns what a person types into an "HH:mm" time. Pure, so the picker's typing rules are testable.

const pad = (n: number) => String(n).padStart(2, "0");

function build(hours: number, minutes: number): string | null {
  return Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    ? `${pad(hours)}:${pad(minutes)}`
    : null;
}

/**
 * Reads "22:00", "22h00", "22.00", "2200", "930" and, when `hourOnly` is on, "9" or "22".
 * Returns "HH:mm", or null when the text is not a valid time.
 */
export function parseTimeInput(text: string, hourOnly = false): string | null {
  const t = text.trim();

  const colon = /^(\d{1,2})\s*[:h.]\s*(\d{2})$/.exec(t);
  if (colon) return build(Number(colon[1]), Number(colon[2]));

  const digits = /^(\d{1,2})(\d{2})$/.exec(t);
  if (digits) return build(Number(digits[1]), Number(digits[2]));

  if (hourOnly && /^\d{1,2}$/.test(t)) return build(Number(t), 0);
  return null;
}

/**
 * True once the text is a finished time while typing: "22:00" or "2200", but not "220" or "22",
 * which could still be on the way to "2200" and must not be rewritten under the person's fingers.
 */
export function isFinishedTyping(text: string): boolean {
  return /^\d{1,2}\s*[:h.]\s*\d{2}$/.test(text.trim()) || /^\d{4}$/.test(text.trim());
}

export const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
export const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));
