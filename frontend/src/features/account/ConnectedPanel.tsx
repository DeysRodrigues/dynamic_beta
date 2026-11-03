import { useState } from "react";
import { LayoutDashboard, Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { deleteServerData, disconnect, syncNow } from "@/sync/connection";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSession } from "@/sync/session";
import { useSync } from "@/sync/status";
import { useConflictUi } from "./conflictUi";
import { timeAgo } from "./timeAgo";
import { SyncStatusBadge } from "./SyncStatusBadge";

/** What the account page shows while connected: who, where, how the sync is going, and the way out. */
export function ConnectedPanel() {
  const user = useSession((s) => s.user);
  const serverUrl = useSession((s) => s.serverUrl);
  const status = useSync((s) => s.status);
  const conflicts = useSync((s) => s.conflicts);
  const problem = useSync((s) => s.problem);
  const documents = useSync((s) => s.documents);
  const pending = useSync((s) => s.pending);
  const reopen = useConflictUi((s) => s.reopen);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLayout, setConfirmLayout] = useState(false);
  const resetDashboard = useDashboardStore((s) => s.resetDashboard);
  const workspaceName = useDashboardStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId)?.name);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function wipe() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteServerData();
    } catch {
      setDeleteError("Não consegui apagar agora. Tente de novo.");
      setDeleting(false);
    }
    setConfirmDelete(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Conectado como</p>
        <p className="text-lg font-bold break-all">{user?.email}</p>
        <p className="text-xs opacity-50 break-all">Servidor: {serverUrl}</p>
      </div>

      <SyncStatusBadge />
      {pending > 0 && (
        <p className="text-sm opacity-70" role="status">
          {pending} {pending === 1 ? "item mudou" : "itens mudaram"} aqui e {pending === 1 ? "está" : "estão"} aguardando envio.
        </p>
      )}

      {problem === "app_outdated" && (
        <p className="text-sm text-amber-500" role="alert">Parte dos dados do servidor é de uma versão mais nova do app e foi deixada de lado. Atualize a página.</p>
      )}

      {conflicts.length > 0 && (
        <button type="button" onClick={reopen} className="px-4 py-2.5 rounded-xl bg-orange-500/20 text-orange-500 text-sm font-bold hover:bg-orange-500/30 transition">
          Resolver {conflicts.length} {conflicts.length === 1 ? "conflito" : "conflitos"}
        </button>
      )}

      <section className="space-y-2" aria-label="O que já está no servidor">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">O que já está no servidor</p>
        {documents.length === 0 ? (
          <p className="text-sm opacity-60">Ainda nada foi enviado. Mexa em algo (o nome, um widget) e em instantes aparece aqui.</p>
        ) : (
          <ul className="rounded-2xl bg-current/5 p-2 text-sm">
            {[...documents].sort((a, b) => a.label.localeCompare(b.label)).map((doc) => (
              <li key={doc.key} className="flex items-center justify-between gap-3 px-3 py-1.5">
                <span>{doc.label}</span>
                <span className="text-xs opacity-50 whitespace-nowrap">versão {doc.revision} · {timeAgo(doc.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="rounded-2xl bg-amber-500/10 text-amber-500 text-sm p-4" role="note">
        O login dura 14 dias. Passado esse prazo, o app volta sozinho ao modo só neste navegador (nada é apagado) e é só entrar de novo para continuar sincronizando.
      </p>

      <p className="text-sm opacity-60">
        Seus dados continuam salvos neste navegador, e o servidor guarda uma cópia. Mudanças feitas em outro aparelho chegam aqui sozinhas.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void syncNow()}
          disabled={status === "syncing"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
        >
          {status === "syncing" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Sincronizar agora
        </button>
        <button type="button" onClick={() => disconnect("user")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-current/10 text-sm font-bold hover:bg-current/15 transition">
          <LogOut size={16} /> Sair
        </button>
      </div>
      <p className="text-xs opacity-50">"Sair" volta a usar só este navegador, sem apagar nada.</p>

      <section className="space-y-3" aria-label="Seus dados">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Seus dados</p>
        <div className="rounded-2xl bg-current/5 p-4 space-y-2">
          <p className="text-sm font-bold">Restaurar os widgets ao padrão</p>
          <p className="text-xs opacity-60">
            Volta o painel{workspaceName ? ` "${workspaceName}"` : " atual"} aos widgets e à disposição de fábrica. Tarefas, tema, perfil e o resto continuam como estão, e a conta não é tocada. A mudança vai pro servidor junto com o resto.
          </p>
          <button type="button" onClick={() => setConfirmLayout(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-current/10 text-sm font-bold hover:bg-current/15 transition">
            <LayoutDashboard size={16} /> Restaurar widgets
          </button>
        </div>
        <div className="rounded-2xl bg-red-500/5 p-4 space-y-2">
          <p className="text-sm font-bold text-red-500">Apagar tudo da conta</p>
          <p className="text-xs opacity-60">Remove a cópia inteira do servidor (a conta continua existindo) e volta ao modo local. Os dados deste navegador ficam. Se só quer arrumar os widgets, use o botão acima.</p>
          <button type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500/20 transition disabled:opacity-50">
            <Trash2 size={16} /> Apagar dados da conta
          </button>
        </div>
      </section>
      {deleteError && <p className="text-sm text-red-500" role="alert">{deleteError}</p>}

      <ConfirmModal
        isOpen={confirmLayout}
        title="Restaurar os widgets?"
        message="O painel atual volta aos widgets e à disposição padrão. Seus outros dados não são apagados."
        confirmLabel="Restaurar"
        onCancel={() => setConfirmLayout(false)}
        onConfirm={() => {
          resetDashboard();
          setConfirmLayout(false);
        }}
      />
      <ConfirmModal
        isOpen={confirmDelete}
        title="Apagar os dados da conta?"
        message="Isso apaga a cópia guardada no servidor e volta ao modo só neste navegador. Os dados deste navegador não são apagados."
        confirmLabel="Apagar do servidor"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void wipe()}
      />
    </div>
  );
}
