import { Calendar, Sparkles, Plus, ChevronRight } from "lucide-react";
import ShinyText from "@/components/landing/ShinyText";
import type { WeekGroup } from "@/store/useWeekStore";

interface WeekHeaderProps {
  weeks: WeekGroup[];
  activeWeekId: string | null;
  onSetActiveWeek: (id: string) => void;
  onToggleCreating: () => void;
}

export function WeekHeader({ 
  weeks, 
  activeWeekId, 
  onSetActiveWeek, 
  onToggleCreating 
}: WeekHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 transition-colors duration-500"
             style={{ 
                backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                color: 'var(--primary)'
             }}>
           <Calendar size={28} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 opacity-60"
               style={{ color: 'var(--primary)' }}>
             <Sparkles size={10} /> Planejamento
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              <ShinyText text="Cronograma Semanal" disabled={false} speed={3} />
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 p-1.5 rounded-2xl backdrop-blur-md transition-colors duration-500 w-full md:w-auto shadow-xl"
           style={{ 
              backgroundColor: 'color-mix(in srgb, var(--box-text-color) 8%, transparent)',
           }}>
        <div className="relative flex-1 md:flex-none">
          <select
            className="w-full md:w-64 pl-4 pr-10 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-transparent outline-none cursor-pointer appearance-none border-none"
            value={activeWeekId || ""}
            onChange={(e) => onSetActiveWeek(e.target.value)}
          >
            <option value="" disabled className="bg-[var(--box-color)]">Selecionar Semana</option>
            {weeks.map((w) => (
              <option key={w.id} value={w.id} className="bg-[var(--box-color)]">{w.name}</option>
            ))}
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 opacity-40 pointer-events-none" />
        </div>
        
        <button
          onClick={onToggleCreating}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 text-xs font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
        >
          <Plus size={16} strokeWidth={3} /> Novo Ciclo
        </button>
      </div>
    </div>
  );
}
