import { useState, useCallback, memo } from "react";
import { 
  Trophy, Plus, Trash2, 
  Target, Calendar, 
  X, ChevronUp, Activity, BarChart3, LayoutGrid,
  Star, Zap, 
  CheckCircle2
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { getTodayDate, formatDate } from "@/utils/DateUtils";
import { cn } from "@/lib/utils";

// --- TIPOS (Movidos para fora) ---
interface ActivityLog {
  id: string;
  name: string;
  value: number;
  date: string; 
}

interface ActivityPreset {
  id: string;
  name: string;
  value: number;
}

interface GoalTracker {
  id: string;
  title: string;
  unit: string;
  dailyGoal: number;
  totalGoal: number;
  logs: ActivityLog[];
  presets: ActivityPreset[];
}

// --- SUB-COMPONENTES (Extraídos e Memoizados para Performance) ---

const ProgressBar = memo(({ current, total, colorClass = "bg-primary" }: { current: number, total: number, colorClass?: string }) => {
  const percent = Math.min((current / total) * 100, 100);
  return (
    <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
      <div 
        className={cn("h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", colorClass)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
});

const WeekGraph = memo(({ tracker, selectedDate, onSelectDate }: { tracker: GoalTracker, selectedDate: string, onSelectDate: (d: string) => void }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="flex items-end justify-between gap-1 h-14 mt-2 px-1 animate-in fade-in duration-300">
      {days.map(date => {
        const dayTotal = tracker.logs.filter(l => l.date === date).reduce((acc, l) => acc + l.value, 0);
        const progress = Math.min((dayTotal / tracker.dailyGoal) * 100, 100);
        const isOver = dayTotal >= tracker.dailyGoal;
        const isSelected = date === selectedDate;
        const isToday = date === getTodayDate();

        return (
          <div 
            key={date} 
            onClick={() => onSelectDate(date)}
            className="flex flex-col items-center gap-1 flex-1 group cursor-pointer"
          >
            <div className="relative w-full flex justify-center items-end h-full pt-2">
              <div 
                className={cn(
                  "w-1.5 sm:w-2 rounded-full transition-all duration-300 relative group-hover:scale-x-125",
                  isToday ? "bg-black/20 dark:bg-white/20" : "bg-black/5 dark:bg-white/5",
                  isSelected && "ring-1 ring-primary ring-offset-1 dark:ring-offset-black"
                )}
                style={{ height: '100%' }}
              >
                 <div 
                   className={cn(
                     "absolute bottom-0 w-full rounded-full transition-all",
                     isOver ? "bg-yellow-500 dark:bg-yellow-400 shadow-[0_0_8px_#eab308]" : "bg-primary dark:bg-blue-400"
                   )}
                   style={{ height: `${progress}%` }}
                 />
              </div>
              <div className="hidden sm:block absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                 <div className="bg-popover dark:bg-zinc-800 text-popover-foreground text-[9px] px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap font-bold">
                    {dayTotal} {tracker.unit}
                 </div>
              </div>
            </div>
            <span className={cn("text-[8px] font-bold uppercase transition-colors", isSelected ? "text-primary dark:text-blue-300 scale-110" : "opacity-30")}>
              {new Date(date + "T00:00").toLocaleDateString('pt-BR', { weekday: 'narrow' })}
            </span>
          </div>
        );
      })}
    </div>
  );
});

const MonthReport = memo(({ tracker, selectedDate, onSelectDate }: { tracker: GoalTracker, selectedDate: string, onSelectDate: (d: string) => void }) => {
  const year = parseInt(selectedDate.split("-")[0]);
  const month = parseInt(selectedDate.split("-")[1]) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthLogs = tracker.logs.filter(l => {
      const d = new Date(l.date + "T00:00");
      return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthTotal = monthLogs.reduce((acc, l) => acc + l.value, 0);
  const now = new Date();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
  const daysPassed = isCurrentMonth ? now.getDate() : daysInMonth;
  const dailyAverage = Math.round(monthTotal / Math.max(1, daysPassed));
  const bestDayVal = Math.max(0, ...monthLogs.map(l => l.value));

  return (
      <div className="animate-in fade-in zoom-in-95 duration-300 mt-2">
          <div className="grid grid-cols-3 text-[10px] mb-3 bg-black/5 dark:bg-transparent p-2 rounded-lg border border-black/5 dark:border-white/10 gap-y-2">
              <div className="text-center">
                  <p className="opacity-50 uppercase tracking-wider text-[8px]">Total Mês</p>
                  <p className="font-bold text-primary dark:text-blue-300 truncate px-1">{monthTotal.toLocaleString()}</p>
              </div>
              <div className="text-center border-x border-current/10">
                  <p className="opacity-50 uppercase tracking-wider text-[8px]">Média/Dia</p>
                  <p className="font-bold truncate px-1">{dailyAverage.toLocaleString()}</p>
              </div>
              <div className="text-center">
                  <p className="opacity-50 uppercase tracking-wider text-[8px]">Best Day</p>
                  <p className="font-bold text-yellow-600 dark:text-yellow-400 truncate px-1">{bestDayVal.toLocaleString()}</p>
              </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayTotal = tracker.logs.filter(l => l.date === dateStr).reduce((acc, l) => acc + l.value, 0);
                  const intensity = Math.min(dayTotal / tracker.dailyGoal, 1.5); 
                  const isSelected = dateStr === selectedDate;
                  
                  let bgClass = "bg-black/5 dark:bg-white/5"; 
                  if (dayTotal > 0) {
                      if (dayTotal >= tracker.dailyGoal) bgClass = "bg-yellow-500 dark:bg-yellow-500/80 shadow-[0_0_5px_#eab308]";
                      else if (intensity > 0.6) bgClass = "bg-primary dark:bg-blue-600";
                      else bgClass = "bg-primary/50 dark:bg-blue-600/50";
                  }

                  return (
                      <div 
                          key={day}
                          onClick={() => onSelectDate(dateStr)}
                          className={cn(
                              "aspect-square rounded-md flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all relative group",
                              bgClass,
                              isSelected ? "ring-2 ring-offset-1 ring-current z-10" : "hover:opacity-80 active:scale-95",
                              dayTotal > 0 ? "text-white" : "text-current opacity-30 hover:opacity-100"
                          )}
                          title={`${dateStr}: ${dayTotal}`}
                      >
                          {day}
                      </div>
                  );
              })}
          </div>
      </div>
  );
});

// --- COMPONENTE PRINCIPAL ---

export default function ActivityGoalsBox({ id = "activity-goals-default" }: { id?: string }) {
  // OTIMIZAÇÃO: Usa seletor para evitar re-render quando OUTROS boxes mudam
  const setBoxContent = useBoxContentStore(state => state.setBoxContent);
  
  // Leitura inicial apenas (sem subscrever a updates futuros para evitar loops de render)
  // Como gerenciamos o estado localmente, só precisamos ler uma vez na montagem
  const [trackers, setTrackers] = useState<GoalTracker[]>(() => {
    return useBoxContentStore.getState().getBoxContent(id).trackers || [];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  const [newTitle, setNewTitle] = useState("");
  const [newUnit, setNewUnit] = useState("XP");
  const [newDaily, setNewDaily] = useState("");
  const [newTotal, setNewTotal] = useState("");
  
  const [activityName, setActivityName] = useState("");
  const [activityValue, setActivityValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // Função centralizada de salvamento
  const save = useCallback((data: GoalTracker[]) => {
    setTrackers(data);
    setBoxContent(id, { trackers: data });
  }, [id, setBoxContent]);

  const addTracker = () => {
    if (!newTitle || !newDaily || !newTotal) return;
    const newItem: GoalTracker = {
      id: crypto.randomUUID(),
      title: newTitle,
      unit: newUnit,
      dailyGoal: Number(newDaily),
      totalGoal: Number(newTotal),
      logs: [],
      presets: []
    };
    save([...trackers, newItem]);
    setIsAdding(false);
    setNewTitle(""); setNewDaily(""); setNewTotal("");
  };

  const addLog = (trackerId: string) => {
    if (!activityValue) return;
    const updated = trackers.map(t => {
      if (t.id === trackerId) {
        const newLog: ActivityLog = {
          id: crypto.randomUUID(),
          name: activityName || "Atividade",
          value: Number(activityValue),
          date: selectedDate
        };
        return { ...t, logs: [newLog, ...t.logs] };
      }
      return t;
    });
    save(updated);
    setActivityName(""); setActivityValue("");
  };

  const savePreset = (trackerId: string) => {
    if (!activityName || !activityValue) return alert("Preencha nome e valor para criar um atalho.");
    const updated = trackers.map(t => {
      if (t.id === trackerId) {
        const currentPresets = t.presets || [];
        const newPreset: ActivityPreset = {
          id: crypto.randomUUID(),
          name: activityName,
          value: Number(activityValue)
        };
        return { ...t, presets: [...currentPresets, newPreset] };
      }
      return t;
    });
    save(updated);
  };

  const usePreset = (trackerId: string, preset: ActivityPreset) => {
    const updated = trackers.map(t => {
      if (t.id === trackerId) {
        const newLog: ActivityLog = {
          id: crypto.randomUUID(),
          name: preset.name,
          value: preset.value,
          date: selectedDate
        };
        return { ...t, logs: [newLog, ...t.logs] };
      }
      return t;
    });
    save(updated);
  };

  const deletePreset = (e: React.MouseEvent, trackerId: string, presetId: string) => {
    e.stopPropagation();
    const updated = trackers.map(t => {
      if (t.id === trackerId) {
        return { ...t, presets: (t.presets || []).filter(p => p.id !== presetId) };
      }
      return t;
    });
    save(updated);
  };

  const removeLog = (trackerId: string, logId: string) => {
    const updated = trackers.map(t => {
      if (t.id === trackerId) return { ...t, logs: t.logs.filter(l => l.id !== logId) };
      return t;
    });
    save(updated);
  };

  const deleteTracker = (trackerId: string) => {
    if(confirm("Excluir este objetivo?")) save(trackers.filter(t => t.id !== trackerId));
  };

  return (
    <div className="box-padrao p-0 flex flex-col relative overflow-hidden h-full">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-current/5 flex flex-wrap justify-between items-center gap-2 bg-current/5 dark:bg-transparent backdrop-blur-md z-10 min-h-[50px]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-lg text-yellow-600 dark:text-yellow-400 shrink-0">
            <Trophy size={16} />
          </div>
          <h2 className="font-bold text-sm truncate max-w-[100px] sm:max-w-none">Metas</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setViewMode(prev => prev === 'week' ? 'month' : 'week')}
            className="p-1.5 rounded-lg hover:bg-current/10 opacity-60 hover:opacity-100 transition shrink-0"
          >
            {viewMode === 'week' ? <LayoutGrid size={16} /> : <BarChart3 size={16} />}
          </button>

          <label className="flex items-center gap-2 cursor-pointer group bg-black/5 dark:bg-transparent hover:bg-black/10 dark:hover:bg-white/5 px-2 py-1 rounded-lg transition border border-transparent hover:border-current/10 shrink-0">
             <Calendar size={14} className={cn("transition", selectedDate === getTodayDate() ? "opacity-50" : "text-primary dark:text-blue-400 animate-pulse")}/>
             <span className="text-[10px] font-mono font-bold opacity-80">
               {selectedDate === getTodayDate() ? "Hoje" : formatDate(selectedDate).split(',')[0]}
             </span>
             <input type="date" className="hidden" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </label>

          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className={cn(
              "p-1.5 rounded-lg transition border shrink-0",
              isAdding ? "bg-primary text-primary-foreground border-primary" : "border-transparent hover:bg-current/10 opacity-60 hover:opacity-100"
            )}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* FORMULÁRIO */}
      {isAdding && (
        <div className="p-4 bg-current/5 dark:bg-transparent border-b border-current/5 animate-in slide-in-from-top-2 space-y-3 shadow-inner">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[140px] space-y-1">
              <label className="text-[9px] font-bold opacity-50 uppercase ml-1">Nome</label>
              <input placeholder="Ex: Passe de Batalha" className="w-full text-xs p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-current/5 outline-none focus:ring-1 focus:ring-primary/50 transition" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            </div>
            <div className="w-20 space-y-1">
              <label className="text-[9px] font-bold opacity-50 uppercase ml-1">Unidade</label>
              <input placeholder="XP" className="w-full text-xs p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-current/5 outline-none focus:ring-1 focus:ring-primary/50 text-center transition" value={newUnit} onChange={e => setNewUnit(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[100px] space-y-1">
              <label className="text-[9px] font-bold opacity-50 uppercase ml-1">Meta Diária</label>
              <input type="number" placeholder="1000" className="w-full text-xs p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-current/5 outline-none focus:ring-1 focus:ring-primary/50 transition" value={newDaily} onChange={e => setNewDaily(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[100px] space-y-1">
              <label className="text-[9px] font-bold opacity-50 uppercase ml-1">Meta Total</label>
              <input type="number" placeholder="50000" className="w-full text-xs p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-current/5 outline-none focus:ring-1 focus:ring-primary/50 transition" value={newTotal} onChange={e => setNewTotal(e.target.value)} />
            </div>
          </div>
          <button onClick={addTracker} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition active:scale-95">CRIAR OBJETIVO</button>
        </div>
      )}

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {trackers.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 gap-3 min-h-[150px]">
            <div className="p-4 bg-current/5 rounded-full"><Target size={32} /></div>
            <div className="text-center">
              <p className="text-xs font-bold">Nenhum objetivo ativo</p>
              <p className="text-[10px]">Adicione XP, Finanças ou Fitness.</p>
            </div>
          </div>
        )}

        {trackers.map(tracker => {
          const totalAccumulated = tracker.logs.reduce((acc, l) => acc + l.value, 0);
          const totalPercent = Math.min((totalAccumulated / tracker.totalGoal) * 100, 100);
          const selectedDateTotal = tracker.logs.filter(l => l.date === selectedDate).reduce((acc, l) => acc + l.value, 0);
          const selectedDatePercent = Math.min((selectedDateTotal / tracker.dailyGoal) * 100, 100);
          const isExpanded = expandedId === tracker.id;
          const logsForDate = tracker.logs.filter(l => l.date === selectedDate);
          const presets = tracker.presets || [];

          return (
            <div key={tracker.id} className="relative dark:bg-transparent backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group/card">
              
              <button onClick={() => deleteTracker(tracker.id)} className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-400 rounded-lg transition"><Trash2 size={12}/></button>

              <div className="mb-3 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm truncate">{tracker.title}</h3>
                  {totalPercent >= 100 && <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-[9px] px-1.5 rounded font-bold border border-yellow-200 dark:border-yellow-800">CONCLUÍDO</span>}
                </div>
                <div className="flex flex-wrap justify-between items-end text-[10px]">
                  <span className="opacity-60 font-medium">Progresso Total</span>
                  <span className="font-mono font-bold opacity-80">{totalAccumulated.toLocaleString()} <span className="opacity-50">/ {tracker.totalGoal.toLocaleString()} {tracker.unit}</span></span>
                </div>
                <div className="mt-1">
                  <ProgressBar current={totalAccumulated} total={tracker.totalGoal} colorClass="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-400" />
                </div>
              </div>

              {/* GRÁFICO CONTAINER */}
              <div className="bg-black/5 dark:bg-transparent dark:border dark:border-white/10 rounded-xl p-2 mb-3">
                {viewMode === 'week' 
                  ? <WeekGraph tracker={tracker} selectedDate={selectedDate} onSelectDate={setSelectedDate} /> 
                  : <MonthReport tracker={tracker} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                }
              </div>

              {/* CARD EXPANDIDO */}
              <div className={cn(
                "rounded-xl transition-all duration-300 border border-transparent",
                isExpanded 
                   ? " dark:bg-transparent shadow-lg dark:shadow-none border-black/5 dark:border-white/10 p-3 -mx-2 -mb-2" 
                   : ""
              )}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded-md", selectedDatePercent >= 100 ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400" : "bg-current/5")}>
                      {selectedDatePercent >= 100 ? <CheckCircle2 size={12}/> : <Activity size={12}/>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold leading-none">{selectedDate === getTodayDate() ? "Hoje" : formatDate(selectedDate).split(',')[0]}</p>
                      <p className="text-[9px] opacity-60 font-mono mt-0.5">{selectedDateTotal} / {tracker.dailyGoal} {tracker.unit}</p>
                    </div>
                  </div>
                  <div className="w-16"><ProgressBar current={selectedDateTotal} total={tracker.dailyGoal} colorClass={selectedDatePercent >= 100 ? "bg-green-500" : "bg-primary dark:bg-blue-500"} /></div>
                </div>

                {/* ÁREA DE INPUT + PRESETS */}
                <div className="space-y-2">
                  {presets.length > 0 && isExpanded && (
                    <div className="flex flex-wrap gap-1.5 mb-2 animate-in fade-in slide-in-from-left-2">
                      {presets.map(p => (
                        <div key={p.id} className="group/chip relative">
                          <button onClick={() => usePreset(tracker.id, p)} className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 text-[9px] px-2 py-1 rounded-full transition text-yellow-800 dark:text-yellow-400 font-medium active:scale-95">
                            <Zap size={10} className="fill-yellow-500 text-yellow-500"/>{p.name} <span className="opacity-60">+{p.value}</span>
                          </button>
                          <button onClick={(e) => deletePreset(e, tracker.id, p.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/chip:opacity-100 transition scale-75 hover:scale-100 shadow-sm"><X size={8}/></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 relative">
                    <input 
                      placeholder="Descrição..." 
                      className="flex-[2] min-w-[80px] bg-current/5 dark:bg-black/20 border-0 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition placeholder:opacity-40" 
                      value={isExpanded ? activityName : ""} 
                      onChange={e => setActivityName(e.target.value)} 
                      onFocus={() => setExpandedId(tracker.id)} 
                    />
                    <input 
                      type="number" 
                      placeholder="Val" 
                      className="flex-1 min-w-[50px] bg-current/5 dark:bg-black/20 border-0 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition placeholder:opacity-40 text-center font-mono" 
                      value={isExpanded ? activityValue : ""} 
                      onChange={e => setActivityValue(e.target.value)} 
                      onFocus={() => setExpandedId(tracker.id)} 
                      onKeyDown={e => e.key === 'Enter' && addLog(tracker.id)} 
                    />
                    
                    <button onClick={() => addLog(tracker.id)} className="bg-primary hover:opacity-90 text-primary-foreground w-8 rounded-lg flex items-center justify-center transition shadow-sm shrink-0"><Plus size={14}/></button>
                    {activityName && activityValue && <button onClick={() => savePreset(tracker.id)} className="bg-yellow-400 hover:bg-yellow-500 text-white w-8 rounded-lg flex items-center justify-center transition shadow-sm shrink-0 animate-in zoom-in"><Star size={14} className="fill-white"/></button>}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-1 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                      {logsForDate.length === 0 ? (
                        <p className="text-[10px] opacity-40 text-center py-2 italic">Nenhum registro.</p>
                      ) : (
                        logsForDate.map(log => (
                          <div key={log.id} className="flex justify-between items-center text-[10px] p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg group/log transition">
                            <span className="font-medium opacity-80 truncate max-w-[120px] sm:max-w-[140px]">{log.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-primary dark:text-blue-300">+{log.value}</span>
                              <button onClick={() => removeLog(tracker.id, log.id)} className="text-red-400 opacity-0 group-hover/log:opacity-100 transition hover:scale-110"><X size={12} /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button onClick={() => setExpandedId(null)} className="w-full flex items-center justify-center gap-1 text-[9px] font-bold opacity-40 hover:opacity-100 mt-2 py-1 cursor-pointer transition"><ChevronUp size={10} /> Recolher</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}