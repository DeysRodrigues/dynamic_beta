/**
 * Retorna a data local atual no formato YYYY-MM-DD.
 * Essencial para comparar datas corretamente independente do fuso horário.
 */
export function getTodayDate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(now.getTime() - offsetMs);
  return localTime.toISOString().split("T")[0];
}

/**
 * Formata: "seg., 09 set" (para exibição no topo do dashboard)
 */
export function getFormattedCurrentDate(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/**
 * Converte "2024-01-01" para "seg., 01 jan"
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
  // Usamos T00:00:00 para garantir que estamos no início do dia local
  const dt = new Date(start + "T00:00:00");
  const endDt = new Date(end + "T00:00:00");
  
  while (dt <= endDt) {
    arr.push(new Date(dt).toISOString().split("T")[0]);
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
}
