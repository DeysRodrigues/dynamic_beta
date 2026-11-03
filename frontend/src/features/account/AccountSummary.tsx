import { useNavigate } from "react-router-dom";
import { Cloud, HardDrive } from "lucide-react";
import { useSession } from "@/sync/session";
import { SyncStatusBadge } from "./SyncStatusBadge";

/** A short line about the account in the settings drawer, with the way to the full page. */
export function AccountSummary({ onNavigate }: { onNavigate: () => void }) {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const connected = useSession((s) => !!s.token);

  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Conta</h3>
      <div className="p-3 rounded-xl bg-white/5 space-y-2">
        <p className="flex items-center gap-2 text-xs font-medium text-white/80">
          {connected ? <Cloud size={14} className="text-emerald-400" /> : <HardDrive size={14} />}
          {connected ? user?.email : "Só neste navegador"}
        </p>
        <div className="text-white/60 text-xs">
          <SyncStatusBadge />
        </div>
        <button
          type="button"
          onClick={() => { onNavigate(); navigate("/account"); }}
          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold transition"
        >
          {connected ? "Gerenciar conta" : "Conectar a um servidor"}
        </button>
      </div>
    </section>
  );
}
