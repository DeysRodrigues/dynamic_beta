import { useState } from "react";
import { Plus, Edit3 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import TaskItem from "@/components/ui/TaskItem";
import { formatDate } from "@/utils/DateUtils";
import { groupTasksByDate } from "@/utils/TaskUtils";
import { BulkTaskModal } from "@/components/tasks/BulkTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { BulkEditModal } from "@/components/tasks/BulkEditModal";
import type { Task } from "@/types/Task";

interface BoxTaskProps {
  filter?: "all" | "completed" | "incomplete";
  className?: string;
}

export default function BoxTask({ filter = "all", className }: BoxTaskProps) {
  const { tasks, toggleCompleted, deleteTask, addTask } = useTaskStore();
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Estados para Edição Individual
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para Edição em Massa
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  const grouped = groupTasksByDate(filteredTasks);

  return (
    <div className={`box-padrao flex flex-col ${className || ""}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {filter === "all" ? "Tarefas" : filter === "completed" ? "Concluídas" : "Pendentes"}
        </h2>
        
        <div className="flex gap-1">
          {/* Botão Bulk Edit */}
          <button
            onClick={() => setShowBulkEdit(true)}
            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition"
            title="Editar lista (Script)"
          >
            <Edit3 size={16} />
          </button>
          
          {/* Botão Adicionar */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="p-1.5 bg-primary text-white rounded-lg hover:opacity-90 transition shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Modais */}
      <BulkTaskModal 
        isOpen={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
        onAddTasks={(newTasks) => newTasks.forEach(addTask)} 
      />

      <EditTaskModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        task={editingTask} 
      />
      
      <BulkEditModal 
        isOpen={showBulkEdit} 
        onClose={() => setShowBulkEdit(false)} 
        tasksToEdit={filteredTasks} 
      />

      {/* Lista */}
      <div className="flex-1 overflow-hidden">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
            <p>Você ainda não possui tasks :(</p>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2 space-y-4 max-h-full h-full custom-scrollbar">
            {Object.entries(grouped).map(([date, tasksForDate]) => (
              <div key={date} className="flex flex-col gap-2">
                <div className="sticky top-0 bg-gray-100 z-10 py-1 border-b border-gray-200">
                  <h2 className="font-bold text-gray-700 text-sm">{formatDate(date)}</h2>
                </div>
                {tasksForDate.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleCompleted}
                    onDelete={deleteTask}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}