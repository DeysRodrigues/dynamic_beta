import { createPortal } from "react-dom";
import { resolveAllConflicts, resolveConflict } from "@/sync/connection";
import { useSync } from "@/sync/status";
import { useConflictUi } from "./conflictUi";

const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/**
 * Asks which version to keep when the same saved data changed here and on the server. The app
 * cannot merge two versions, so it never chooses by itself and nothing is overwritten until the
 * person answers.
 */
export default function ConflictDialog() {
  const conflicts = useSync((s) => s.conflicts);
  const dismissedFor = useConflictUi((s) => s.dismissedFor);
  const dismiss = useConflictUi((s) => s.dismiss);

  const signature = conflicts.map((c) => `${c.key}@${c.server.revision}`).join("|");
  if (conflicts.length === 0 || dismissedFor === signature) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div role="dialog" aria-label="Conflito de sincronização" className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111] text-white rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Seus dados mudaram nos dois lugares</h3>
          <p className="text-sm text-white/60">
            O que está neste navegador e o que está no servidor são diferentes. Escolha qual manter, uma por uma ou todas de uma vez. Nada é apagado até você escolher.
          </p>
        </div>

        <ul className="space-y-3">
          {conflicts.map((conflict) => (
            <li key={conflict.key} className="rounded-xl bg-white/5 p-4 space-y-3">
              <div>
                <p className="font-bold">{conflict.label}</p>
                <p className="text-xs text-white/50">Versão do servidor de {formatDate(conflict.server.updatedAt)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => void resolveConflict(conflict.key, "server")} className="py-2 rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20 transition">
                  Usar a do servidor
                </button>
                <button type="button" onClick={() => void resolveConflict(conflict.key, "local")} className="py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition">
                  Manter a daqui
                </button>
              </div>
            </li>
          ))}
        </ul>

        {conflicts.length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => void resolveAllConflicts("server")} className="py-2.5 rounded-xl bg-white/10 text-sm font-bold hover:bg-white/20 transition">Usar tudo do servidor</button>
            <button type="button" onClick={() => void resolveAllConflicts("local")} className="py-2.5 rounded-xl bg-white/10 text-sm font-bold hover:bg-white/20 transition">Manter tudo daqui</button>
          </div>
        )}

        <button type="button" onClick={() => dismiss(signature)} className="w-full text-xs text-white/50 hover:text-white transition">Decidir depois</button>
      </div>
    </div>,
    document.body
  );
}
