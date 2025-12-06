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
    <div className="space-y-6 pt-28 px-4 relative sm:p-14 max-w-[1600px] mx-auto">
      {/* --- BARRA PADRONIZADA --- */}
      <div className="bar-padrao">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-primary" /> Planejamento Semanal
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeWeek
              ? `Visualizando: ${activeWeek.name} (Grupo: ${activeWeek.mainTag})`
              : "Selecione ou crie um grupo para começar."}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex-1 md:w-64 px-4 py-2 border rounded-xl bg-black/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={activeWeekId || ""}
            onChange={(e) => setActiveWeek(e.target.value)}
          >
            <option value="" disabled>
              Selecione uma Semana
            </option>
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} /> Novo Grupo
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="box-padrao animate-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4">Criar Novo Grupo Semanal</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nome"
              value={newWeekName}
              onChange={(e) => setNewWeekName(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full outline-none"
            />
            <select
              value={selectedMainTag}
              onChange={(e) => setSelectedMainTag(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full outline-none"
            >
              <option value="">Selecione a Tagzona</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Início</span>
              <input
                type="date"
                value={startData}
                onChange={(e) => setStartData(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Fim</span>
              <input
                type="date"
                value={endData}
                onChange={(e) => setEndData(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-muted-foreground hover:bg-black/5 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateWeek}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Salvar Semana
            </button>
          </div>
        </div>
      )}

      {activeWeek ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[var(--box-text-color)]">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold px-2 border-l-4 border-primary">
                {activeWeek.name}
              </h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                {activeWeek.mainTag}
              </span>
            </div>
            <button
              onClick={() => {
                if (confirm("Apagar este grupo?")) removeWeek(activeWeek.id);
              }}
              className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={16} /> Excluir
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
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
                <div
                  key={date}
                  className={`min-w-[300px] md:min-w-[320px] box-padrao flex flex-col h-[70vh] snap-center p-0 overflow-hidden ${
                    isToday ? "ring-2 ring-primary/30" : ""
                  }`}
                >
                  <div
                    className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 ${
                      isToday ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold capitalize text-lg">
                        {new Date(date + "T00:00").toLocaleDateString("pt-BR", {
                          weekday: "long",
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(date)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openBulkEdit(date)}
                        className="btn-icon"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => openAddModal(date)}
                        className="btn-icon text-primary"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
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
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 text-sm italic gap-2">
                        <Calendar size={24} /> Vazio
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="box-padrao flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Calendar size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum grupo selecionado</p>
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
  );
}
