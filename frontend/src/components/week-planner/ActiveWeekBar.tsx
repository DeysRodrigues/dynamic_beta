import { Trash2 } from "lucide-react";
import type { WeekGroup } from "@/store/useWeekStore";

interface ActiveWeekBarProps {
  activeWeek: WeekGroup;
  onRemove: (id: string) => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    rate: number;
  };
}

export function ActiveWeekBar({ activeWeek, onRemove, stats }: ActiveWeekBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bar-padrao px-6 py-5 border-none shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Status do Ciclo</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">
              {activeWeek.name}
            </h2>
          </div>
          <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-primary/15 text-primary ml-4">
            {activeWeek.mainTag}
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm("Deseja apagar este ciclo semanal permanentemente?")) onRemove(activeWeek.id);
          }}
          className="text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={16} /> Eliminar
        </button>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="w-full h-1.5 bg-current/[0.05] rounded-full overflow-hidden relative">
        <div 
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_var(--primary)]"
          style={{ width: `${stats.rate}%` }}
        />
      </div>
    </div>
  );
}
