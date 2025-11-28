import { useState } from "react";
import { useWeekStore, type WeekGroup } from "@/store/useWeekStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore";
import { Plus, Calendar, Trash2, Edit3 } from "lucide-react";
import TaskItem from "@/components/ui/TaskItem";
import { formatDate, getTodayDate } from "@/utils/DateUtils";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import type { Task } from "@/types/Task";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";

export default function WeekPlannerPage() {
  const { weeks, addWeek, removeWeek, activeWeekId, setActiveWeek } = useWeekStore();
  const { tasks, toggleCompleted, deleteTask, addTask } = useTaskStore();
  const { tags } = useTagStore();

  // Estados de Criação
  const [isCreating, setIsCreating] = useState(false);
  const [newWeekName, setNewWeekName] = useState("");
  const [startData, setStartData] = useState(getTodayDate());
  const [endData, setEndData] = useState(getTodayDate());
  const [selectedMainTag, setSelectedMainTag] = useState("");

  // Estado do Modal de Adição
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>("");

  // Estado para Edição Individual
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Estado para Edição em Massa (por dia)
  const [bulkEditDate, setBulkEditDate] = useState<string | null>(null);

  // --- Handlers ---

  const handleCreateWeek = () => {
    if (!newWeekName) return alert("Dê um nome para o grupo semanal.");
    if (!selectedMainTag) return alert("Selecione uma Tagzona para representar este grupo.");
    
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

  const weekDays = activeWeek ? getDaysArray(activeWeek.startDate, activeWeek.endDate) : [];

  return (
    <div className="space-y-6 pt-28 px-4 relative sm:p-14 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" /> Planejamento Semanal
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeWeek 
              ? `Visualizando: ${activeWeek.name} (Grupo: ${activeWeek.mainTag})` 
              : "Selecione ou crie um grupo para começar."}
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-64 px-4 py-2 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-100"
            value={activeWeekId || ""}
            onChange={(e) => setActiveWeek(e.target.value)}
          >
            <option value="" disabled>Selecione uma Semana</option>
            {weeks.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button 
            onClick={() => setIsCreating(!isCreating)} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} /> Novo Grupo
          </button>
        </div>
      </div>

      {/* Form de Criação */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4 text-gray-700">Criar Novo Grupo Semanal</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Nome (Ex: Universidade)" 
              value={newWeekName}
              onChange={e => setNewWeekName(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full outline-none"
            />
            
            <select
              value={selectedMainTag}
              onChange={(e) => setSelectedMainTag(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full outline-none bg-white"
            >
              <option value="">Selecione a Tagzona</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Início</span>
              <input type="date" value={startData} onChange={e => setStartData(e.target.value)} className="px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Fim</span>
              <input type="date" value={endData} onChange={e => setEndData(e.target.value)} className="px-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
            <button onClick={handleCreateWeek} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar Semana</button>
          </div>
        </div>
      )}

      {/* Visualização da Semana */}
      {activeWeek ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-700 px-2 border-l-4 border-indigo-500">{activeWeek.name}</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                {activeWeek.mainTag}
              </span>
            </div>
            <button 
              onClick={() => { if(confirm("Apagar este grupo?")) removeWeek(activeWeek.id); }}
              className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={16} /> Excluir
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {weekDays.map((date) => {
              // Filtro por Data E Tagzona
              const dayTasks = tasks
                .filter(t => t.date === date && t.groupTag === activeWeek.mainTag)
                .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
              
              const isToday = date === getTodayDate();

              return (
                <div key={date} className={`min-w-[300px] md:min-w-[320px] bg-gray-50 rounded-xl border ${isToday ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100' : 'border-gray-200'} flex flex-col h-[70vh] snap-center`}>
                  
                  {/* Header do Dia */}
                  <div className={`p-4 border-b ${isToday ? 'bg-indigo-50' : 'bg-white'} rounded-t-xl flex justify-between items-center sticky top-0 z-10`}>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 capitalize text-lg">{new Date(date + "T00:00").toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                        <span className="text-xs text-gray-500">{formatDate(date)}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {/* Botão de Edição em Massa do Dia */}
                      <button 
                          onClick={() => openBulkEdit(date)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition shadow-sm"
                          title="Editar dia em massa"
                      >
                          <Edit3 size={16} />
                      </button>

                      <button 
                          onClick={() => openAddModal(date)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 text-indigo-600 transition shadow-sm"
                      >
                          <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Lista de Tarefas do Dia */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {dayTasks.length > 0 ? (
                      dayTasks.map(task => (
                        <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                            <TaskItem 
                              task={task} 
                              onToggle={toggleCompleted} 
                              onDelete={deleteTask} 
                              onEdit={handleEditClick}
                            />
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm italic gap-2">
                        <Calendar size={24} className="opacity-20" />
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Calendar size={48} className="mb-4 opacity-20 text-indigo-400" />
          <p className="text-lg font-medium text-gray-500">Nenhum grupo selecionado</p>
        </div>
      )}

      {/* Modais */}
      <BulkTaskModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onAddTasks={(newTasks) => newTasks.forEach(addTask)}
        targetDate={selectedDateForModal}
        targetGroupTag={activeWeek?.mainTag} 
      />

      <EditTaskModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={editingTask}
      />

      {/* Bulk Edit Modal para o dia selecionado */}
      {activeWeek && bulkEditDate && (
        <BulkEditModal 
          isOpen={!!bulkEditDate} 
          onClose={() => setBulkEditDate(null)} 
          tasksToEdit={tasks.filter(t => t.date === bulkEditDate && t.groupTag === activeWeek.mainTag)}
        />
      )}
    </div>
  );
}