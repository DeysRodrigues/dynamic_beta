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
  const { tasks, addTask, toggleCompleted, deleteTask, deleteAllTasks, importTasks } = useTaskStore();
  const { tags } = useTagStore();

  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState("");
  
  const [showImportBox, setShowImportBox] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");

  // Estados para Edição Individual
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Estados para Edição em Massa
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
      {/* Barra de Ferramentas */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between sticky top-4 z-20">
        <h1 className="font-bold text-xl text-gray-800">Minhas Tarefas</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter(prev => prev === "all" ? "completed" : "all")} 
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title="Filtrar"
          >
            <Filter size={18} />
          </button>
          
          <button 
            onClick={deleteAllTasks} 
            className="p-2 text-red-500 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title="Apagar tudo"
          >
            <Trash2 size={18} />
          </button>

          <button 
            onClick={() => setShowImportBox(true)} 
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition" 
            title="Importar JSON"
          >
            <Upload size={18} />
          </button>

          {/* Botão de Edição em Massa (Script) */}
          <button 
            onClick={() => setShowBulkEdit(true)} 
            className="p-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition"
            title="Editor em Massa (Script)"
          >
            <Edit3 size={18} />
          </button>

          <button 
            onClick={() => setShowBulkModal(true)} 
            className="px-4 py-2 bg-primary text-white rounded-full flex gap-2 items-center text-sm hover:opacity-90 transition"
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
              createTask(t.description, t.time, t.tag || "", Number(t.duration) || 15)
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

      {/* Input Rápido */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-3 items-center border border-gray-100">
        <input 
          type="time" 
          value={newTime} 
          onChange={(e) => setNewTime(e.target.value)} 
          className="px-3 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" 
        />
        
        <input 
          type="text" 
          placeholder="Nova tarefa..." 
          value={newDescription} 
          onChange={(e) => setNewDescription(e.target.value)} 
          className="flex-1 px-4 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]" 
        />
        
        <select 
          value={newTag} 
          onChange={(e) => setNewTag(e.target.value)} 
          className="px-3 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tag</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <button 
          onClick={handleAddTask} 
          className="bg-primary text-white p-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-6">
        {Object.entries(groupTasksByDate(filteredTasks)).map(([date, dateTasks]) => (
          <div key={date} className="bg-white/50 p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-700 mb-4 capitalize">{formatDate(date)}</h3>
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
        ))}
      </div>
    </div>
  );
}