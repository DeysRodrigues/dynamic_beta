import { useEffect, useState } from "react";
import { useSync, type SyncStatus } from "@/sync/status";
import { timeAgo } from "./timeAgo";

const DOT: Record<SyncStatus, string> = {
  local: "bg-current/40",
  syncing: "bg-sky-400 animate-pulse",
  synced: "bg-emerald-400",
  offline: "bg-amber-400",
  conflict: "bg-orange-500",
  error: "bg-red-500",
};

/** A coloured dot and a sentence about the state of the sync. */
export function SyncStatusBadge() {
  const status = useSync((s) => s.status);
  const lastSyncAt = useSync((s) => s.lastSyncAt);
  const [now, setNow] = useState(() => Date.now());

  // "há 2 min" has to keep up with the clock.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const text: Record<SyncStatus, string> = {
    local: "Só neste navegador",
    syncing: "Sincronizando...",
    synced: lastSyncAt ? `Sincronizado ${timeAgo(lastSyncAt, now)}` : "Sincronizado",
    offline: "Sem conexão. O que você fizer será enviado quando voltar.",
    conflict: "Conflito: falta você escolher qual versão manter.",
    error: "Não deu para sincronizar. Vou tentar de novo.",
  };

  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${DOT[status]}`} aria-hidden />
      {text[status]}
    </span>
  );
}
