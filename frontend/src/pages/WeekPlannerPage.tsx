import { useState } from "react";
import { useWeekStore, type WeekGroup } from "@/store/useWeekStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore";
import { Plus, Calendar, Trash2, Edit3, Sparkles, ChevronRight, Layout } from "lucide-react";
import TaskItem from "@/components/ui/TaskItem";
import { formatDate, getTodayDate } from "@/utils/DateUtils";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import type { Task } from "@/types/Task";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import ShinyText from "@/components/landing/ShinyText";
import SpotlightCard from "@/components/landing/SpotlightCard";
import { cn } from "@/lib/utils";

export default function WeekPlannerPage() {
  const { weeks, addWeek, removeWeek, activeWeekId, setActiveWeek } =
    useWeekStore();
  const { tasks, toggleCompleted, deleteTask, addTask } = useTaskStore();
  const { tags } = useTagStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newWeekName, setNewWeekName] = useState("");
  const [startData, setStartData] = useState(getTodayDate());
  const [endData, setEndData] = useState(getTodayDate());
  const [selectedMainTag, setSelectedMainTag] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkEditDate, setBulkEditDate] = useState<string | null>(null);

  const handleCreateWeek = () => {
    if (!newWeekName) return alert("Dê um nome para o grupo semanal.");
    if (!selectedMainTag)
      return alert("Selecione uma Tagzona para representar este grupo.");
    const newWeek: WeekGroup = {
      id: crypto.randomUUID(),
      name: newWeekName,
      startDate: startData,
      endDate: endData,
      mainTag: selectedMainTag,
    };
    addWeek(newWeek);
    setActiveWeek(newWeek.id);
    setIsCreating(false);
    setNewWeekName("");
    setSelectedMainTag("");
  };

  const openAddModal = (date: string) => {
    setSelectedDateForModal(date);
    setModalOpen(true);
  };
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };
  const openBulkEdit = (date: string) => {
    setBulkEditDate(date);
  };

  const activeWeek = weeks.find((w) => w.id === activeWeekId);
  const getDaysArray = (start: string, end: string) => {
    const arr = [];
    const dt = new Date(start);
    dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
    const endDt = new Date(end);
    endDt.setMinutes(endDt.getMinutes() + endDt.getTimezoneOffset());
    while (dt <= endDt) {
      arr.push(new Date(dt).toISOString().split("T")[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  };
  const weekDays = activeWeek
    ? getDaysArray(activeWeek.startDate, activeWeek.endDate)
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-transparent">
       {/* Background Ambient (Dinâmico) */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-[1600px] space-y-8 pt-10 pb-20 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border shrink-0 transition-colors duration-500"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
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

          <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 rounded-2xl backdrop-blur-sm border transition-colors duration-500 w-full lg:w-auto"
               style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
               }}>
            <select
              className="w-full sm:w-64 px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-transparent outline-none cursor-pointer border-none"
              value={activeWeekId || ""}
              onChange={(e) => setActiveWeek(e.target.value)}
            >
              <option value="" disabled className="bg-[var(--box-color)]">Selecionar Semana</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.id} className="bg-[var(--box-color)]">{w.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 text-xs font-black hover:scale-105 transition-all shadow-lg uppercase tracking-tighter"
            >
              <Plus size={16} strokeWidth={3} /> Novo Grupo
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="box-padrao ring-1 ring-primary/20 animate-in zoom-in-95 duration-300 shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-6 border-b border-current/10 pb-3">
              <Layout size={18} className="text-primary" /> Configurar Novo Ciclo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Identificação</label>
                <input
                  type="text"
                  placeholder="Ex: Sprint #01"
                  value={newWeekName}
                  onChange={(e) => setNewWeekName(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Tagzona Alvo</label>
                <select
                  value={selectedMainTag}
                  onChange={(e) => setSelectedMainTag(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-bold uppercase tracking-widest"
                >
                  <option value="">Selecione...</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Início do Ciclo</label>
                <input
                  type="date"
                  value={startData}
                  onChange={(e) => setStartData(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Fim do Ciclo</label>
                <input
                  type="date"
                  value={endData}
                  onChange={(e) => setEndData(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-current/5">
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-2.5 text-xs font-bold uppercase opacity-50 hover:opacity-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateWeek}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition shadow-xl"
              >
                Salvar Grupo
              </button>
            </div>
          </div>
        )}

        {activeWeek ? (
          <div className="space-y-6 animate-in fade-in duration-1000">
            {/* Ciclo Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-2xl border backdrop-blur-sm transition-colors duration-500"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
                 }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-widest opacity-80">
                  Ciclo Ativo: <span className="text-primary">{activeWeek.name}</span>
                </h2>
                <ChevronRight size={14} className="opacity-20" />
                <span className="text-[10px] font-black px-3 py-1 rounded-full border transition-colors"
                      style={{ 
                        backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                        color: 'var(--primary)'
                      }}>
                  {activeWeek.mainTag}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Deseja apagar este ciclo semanal permanentemente?")) removeWeek(activeWeek.id);
                }}
                className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={14} /> Eliminar Ciclo
              </button>
            </div>

            {/* Grid de Dias */}
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar mask-gradient-right">
              {weekDays.map((date) => {
                const dayTasks = tasks
                  .filter(
                    (t) => t.date === date && t.groupTag === activeWeek.mainTag
                  )
                  .sort((a, b) =>
                    (a.time || "23:59").localeCompare(b.time || "23:59")
                  );
                const isToday = date === getTodayDate();
                
                return (
                  <SpotlightCard 
                    key={date} 
                    className={cn(
                        "min-w-[320px] md:min-w-[360px] snap-center overflow-hidden border-current/5",
                        isToday ? "ring-2 ring-primary/40 shadow-2xl shadow-primary/10" : ""
                    )}
                    spotlightColor={isToday ? "rgba(var(--primary-rgb), 0.15)" : "rgba(127, 127, 127, 0.05)"}
                  >
                    <div className="flex flex-col h-[65vh]">
                      {/* Day Header */}
                      <div className={cn(
                        "p-5 border-b border-current/5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl",
                        isToday ? "bg-primary/5" : "bg-current/5"
                      )}>
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-black capitalize text-xl tracking-tighter",
                            isToday ? "text-primary" : "opacity-90"
                          )}>
                            {new Date(date + "T00:00").toLocaleDateString("pt-BR", { weekday: "long" })}
                          </span>
                          <span className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-0.5">
                            {formatDate(date)} {isToday && "• HOJE"}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openBulkEdit(date)}
                            className="p-2 rounded-xl hover:bg-current/10 transition-colors opacity-40 hover:opacity-100"
                            title="Editar em massa"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => openAddModal(date)}
                            className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Adicionar tarefa"
                          >
                            <Plus size={20} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      {/* Day Tasks */}
                      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
                        {dayTasks.length > 0 ? (
                          dayTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onToggle={toggleCompleted}
                              onDelete={deleteTask}
                              onEdit={handleEditClick}
                            />
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                            <Calendar size={48} strokeWidth={1} />
                            <p className="text-xs font-black uppercase tracking-[0.2em] mt-4">Página em Branco</p>
                          </div>
                        )}
                      </div>

                      {/* Day Footer Stat */}
                      {dayTasks.length > 0 && (
                        <div className="px-5 py-3 bg-current/5 border-t border-current/5 text-[9px] font-black uppercase tracking-widest opacity-30 flex justify-between items-center">
                            <span>Progresso</span>
                            <span>{dayTasks.filter(t => t.completed).length}/{dayTasks.length}</span>
                        </div>
                      )}
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-1000">
            <div className="w-24 h-24 rounded-full bg-current/5 flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
               <Calendar size={40} className="opacity-20" />
            </div>
            <p className="text-xl font-black uppercase tracking-widest opacity-20">Nenhum ciclo ativo</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-6 text-xs font-bold text-primary hover:underline underline-offset-4"
            >
              Criar meu primeiro grupo semanal
            </button>
          </div>
        )}

        <BulkTaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddTasks={(ts) => ts.forEach(addTask)}
          targetDate={selectedDateForModal}
          targetGroupTag={activeWeek?.mainTag}
        />
        <EditTaskModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          task={editingTask}
        />
        {activeWeek && bulkEditDate && (
          <BulkEditModal
            isOpen={!!bulkEditDate}
            onClose={() => setBulkEditDate(null)}
            tasksToEdit={tasks.filter(
              (t) => t.date === bulkEditDate && t.groupTag === activeWeek.mainTag
            )}
          />
        )}
      </div>
    </div>
  );
}
