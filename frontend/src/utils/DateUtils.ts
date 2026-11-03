/**
 * Returns the current local date as YYYY-MM-DD.
 * Local date regardless of the time zone, so dates compare correctly.
 */
export function getTodayDate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(now.getTime() - offsetMs);
  return localTime.toISOString().split("T")[0];
}

/**
 * Formats "seg., 09 set" (shown at the top of the dashboard)
 */
export function getFormattedCurrentDate(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/**
 * Converts "2024-01-01" to "seg., 01 jan"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/**
 * Retorna um array de strings (YYYY-MM-DD) entre start e end (inclusive).
 */
export function getDaysArray(start: string, end: string): string[] {
  const arr = [];
  // T00:00:00 makes sure we are at the start of the local day
  const dt = new Date(start + "T00:00:00");
  const endDt = new Date(end + "T00:00:00");
  
  while (dt <= endDt) {
    arr.push(new Date(dt).toISOString().split("T")[0]);
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
}
