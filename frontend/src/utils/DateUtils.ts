/**
 * Retorna a data local atual no formato "YYYY-MM-DD".
 */
export function getTodayDate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(now.getTime() - offsetMs);
  return localTime.toISOString().split("T")[0];
}

/**
 * Retorna a data atual formatada para exibição (ex: "seg., 09 set").
 */
export function getFormattedCurrentDate(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/**
 * Formata uma string de data (YYYY-MM-DD) para exibição curta em pt-BR.
 * Exemplo: "2025-09-07" → "dom., 07 set"
 */

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const localDate = new Date(year, month - 1, day); // ← Aqui é LOCAL, não UTC

  return localDate.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
