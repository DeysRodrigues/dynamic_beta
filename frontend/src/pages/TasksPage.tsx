import { useState } from "react";
import { Plus, Trash2, Filter, Upload, Edit3 } from "lucide-react";
import TaskItem from "@/components/ui/TaskItem";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import TasksImportBox from "@/components/layout/boxes/TasksImportBox";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore";
import { groupTasksByDate } from "@/utils/TaskUtils";
import { formatDate } from "@/utils/DateUtils";
import { createTask } from "@/utils/TaskFactory";
import type { Task } from "@/types/Task";

export default function TasksPage() {
  const {
    tasks,
    addTask,
    toggleCompleted,
    deleteTask,
    deleteAllTasks,
    importTasks,
  } = useTaskStore();
  const { tags } = useTagStore();

  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState("");

  const [showImportBox, setShowImportBox] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newDescription) return alert("Preencha a descrição da tarefa.");
    addTask(createTask(newDescription, newTime, newTag, 15));
    setNewDescription("");
    setNewTime("");
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  return (
    <div className="space-y-6 pt-28 px-4 relative sm:p-14 max-w-5xl mx-auto">
      {/* --- BARRA DE FERRAMENTAS PADRONIZADA --- */}
      <div className="bar-padrao sticky top-4">
        <h1 className="font-bold text-xl">Minhas Tarefas</h1>

        <div className="flex gap-2">
          {/* Botão de Filtro (Alterna visualmente se ativo) */}
          <button
            onClick={() =>
              setFilter((prev) => (prev === "all" ? "completed" : "all"))
            }
            className={`btn-icon ${
              filter !== "all" ? "text-primary bg-primary/10" : ""
            }`}
            title="Filtrar Concluídas"
          >
            <Filter size={18} />
          </button>

          <button
            onClick={deleteAllTasks}
            className="btn-icon hover:text-red-500 hover:bg-red-500/10"
            title="Apagar tudo"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={() => setShowImportBox(true)}
            className="btn-icon"
            title="Importar JSON"
          >
            <Upload size={18} />
          </button>

          <button
            onClick={() => setShowBulkEdit(true)}
            className="btn-icon text-primary hover:bg-primary/10"
            title="Editor em Massa"
          >
            <Edit3 size={18} />
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full flex gap-2 items-center text-sm hover:opacity-90 transition shadow-sm font-medium"
          >
            <Plus size={16} /> Várias
          </button>
        </div>
      </div>

      {/* Box de Importação */}
      {showImportBox && (
        <TasksImportBox
          onImport={(imported) => {
            const processed = imported.map((t) =>
              createTask(
                t.description,
                t.time,
                t.tag || "",
                Number(t.duration) || 15
              )
            );
            importTasks(processed);
            setShowImportBox(false);
          }}
          onClose={() => setShowImportBox(false)}
        />
      )}

      {/* Modais */}
      <BulkTaskModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onAddTasks={(ts) => ts.forEach(addTask)}
      />
      <EditTaskModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={editingTask}
      />
      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        tasksToEdit={filteredTasks}
      />

      {/* --- INPUT RÁPIDO (BOX UNIFICADA) --- */}
      <div className="box-padrao flex-row flex-wrap gap-3 items-center min-h-0">
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="px-3 py-2 w-auto"
        />

        <input
          type="text"
          placeholder="Nova tarefa..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          className="flex-1 px-4 py-2 min-w-[200px]"
        />

        <select
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="px-3 py-2 w-auto"
        >
          <option value="">Tag</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddTask}
          className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition shadow-sm"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* --- LISTA DE TAREFAS --- */}
      <div className="space-y-6">
        {Object.entries(groupTasksByDate(filteredTasks)).map(
          ([date, dateTasks]) => (
            <div key={date} className="box-padrao">
              {/* Cabeçalho da data com borda sutil baseada na cor do texto */}
              <h3 className="font-bold text-lg mb-4 capitalize border-b border-current/10 pb-2 opacity-80">
                {formatDate(date)}
              </h3>

              <div className="space-y-2">
                {dateTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleCompleted}
                    onDelete={deleteTask}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <p>Nenhuma tarefa encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
