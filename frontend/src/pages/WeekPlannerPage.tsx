import { useState } from "react";
import { useWeekStore, type WeekGroup } from "@/store/useWeekStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore";
import { Plus, Calendar, Trash2, Edit3, Sparkles, ChevronRight, Layout, Check } from "lucide-react";
import TaskItem from "@/components/ui/TaskItem";
import { formatDate, getTodayDate } from "@/utils/DateUtils";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import type { Task } from "@/types/Task";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import ShinyText from "@/components/landing/ShinyText";
import SpotlightCard from "@/components/landing/SpotlightCard";
import { cn } from "@/lib/utils";
import CustomDatePicker from "@/components/ui/CustomDatePicker";

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
       {/* Background Ambient */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-7xl space-y-10 pt-10 pb-32 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        {/* --- HEADER --- */}
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
                onChange={(e) => setActiveWeek(e.target.value)}
              >
                <option value="" disabled className="bg-[var(--box-color)]">Selecionar Semana</option>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[var(--box-color)]">{w.name}</option>
                ))}
              </select>
              <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 opacity-40 pointer-events-none" />
            </div>
            
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 text-xs font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
            >
              <Plus size={16} strokeWidth={3} /> Novo Ciclo
            </button>
          </div>
        </div>

        {/* --- FORMULÁRIO DE CRIAÇÃO --- */}
        {isCreating && (
          <div className="box-padrao border-none animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden p-0">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 mb-1">
                <Layout size={20} className="text-primary" /> Iniciar Novo Ciclo
              </h3>
              <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">Crie um escopo temporal para suas tarefas</p>
            </div>

            <div className="p-8 pt-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Identificação</label>
                    <input
                      type="text"
                      placeholder="Ex: Sprint #01"
                      value={newWeekName}
                      onChange={(e) => setNewWeekName(e.target.value)}
                      className="w-full px-5 py-4 text-sm font-bold rounded-2xl bg-current/[0.06] border-none focus:bg-current/[0.1] outline-none transition-all text-current placeholder:opacity-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Tagzona Alvo</label>
                    <div className="relative">
                      <select
                        value={selectedMainTag}
                        onChange={(e) => setSelectedMainTag(e.target.value)}
                        className="w-full px-5 py-4 text-sm font-bold uppercase tracking-widest bg-current/[0.06] border-none focus:bg-current/[0.1] outline-none transition-all rounded-2xl appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[var(--box-color)]">Selecione uma Tag...</option>
                        {tags.map((t) => (
                          <option key={t} value={t} className="bg-[var(--box-color)]">{t}</option>
                        ))}
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 opacity-30 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomDatePicker 
                    label="Início do Ciclo"
                    value={startData}
                    onChange={setStartData}
                  />
                  
                  <CustomDatePicker 
                    label="Fim do Ciclo"
                    value={endData}
                    onChange={setEndData}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all hover:bg-current/5 rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateWeek}
                  className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3"
                >
                  <Check size={18} strokeWidth={4} /> Validar Cronograma
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTEÚDO ATIVO --- */}
        {activeWeek ? (
          <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Ciclo Info Bar */}
            <div className="bar-padrao px-6 py-5 border-none shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Status do Ciclo</span>
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary">
                    {activeWeek.name}
                  </h2>
                </div>
                <div className="h-6 w-px bg-current/10 mx-2 hidden sm:block" />
                <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-primary/15 text-primary">
                  {activeWeek.mainTag}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Deseja apagar este ciclo semanal permanentemente?")) removeWeek(activeWeek.id);
                }}
                className="text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>

            {/* Grid de Dias */}
            <div className="flex gap-6 overflow-x-auto pb-10 snap-x no-scrollbar mask-gradient-right">
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
                        "box-padrao min-w-[320px] md:min-w-[360px] snap-center overflow-hidden border-none shadow-2xl p-0 gap-0",
                        isToday ? "ring-2 ring-primary/40" : ""
                    )}
                    spotlightColor="color-mix(in srgb, var(--primary) 20%, transparent)"
                  >
                    <div className="flex flex-col h-[65vh]">
                      {/* Day Header */}
                      <div className={cn(
                        "p-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl",
                        isToday ? "bg-primary/10" : "bg-current/[0.04]"
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => openBulkEdit(date)}
                            className="p-2.5 rounded-xl hover:bg-current/10 transition-colors opacity-30 hover:opacity-100"
                            title="Editar em massa"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => openAddModal(date)}
                            className="p-2.5 bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                            title="Adicionar tarefa"
                          >
                            <Plus size={20} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      {/* Day Tasks */}
                      <div className="p-4 pt-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
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
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6">Dia Livre</p>
                          </div>
                        )}
                      </div>

                      {/* Day Footer Stat */}
                      {dayTasks.length > 0 && (
                        <div className="px-6 py-4 bg-current/[0.03] text-[9px] font-black uppercase tracking-[0.2em] opacity-30 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                              Frequência
                            </span>
                            <span className="bg-current/10 px-2 py-0.5 rounded-md">{dayTasks.filter(t => t.completed).length}/{dayTasks.length}</span>
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
