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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
        <h2 className="text-lg font-semibold">
          {filter === "all" ? "Tarefas" : filter === "completed" ? "Concluídas" : "Pendentes"}
        </h2>
        
        <div className="flex gap-1">
          <button
            onClick={() => setShowBulkEdit(true)}
            className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition opacity-60 hover:opacity-100"
            title="Editar lista (Script)"
          >
            <Edit3 size={16} />
          </button>
          
          <button
            onClick={() => setShowBulkModal(true)}
            className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Modais */}
      <BulkTaskModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onAddTasks={(newTasks) => newTasks.forEach(addTask)} />
      <EditTaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} task={editingTask} />
      <BulkEditModal isOpen={showBulkEdit} onClose={() => setShowBulkEdit(false)} tasksToEdit={filteredTasks} />

      {/* Lista */}
      <div className="flex-1 overflow-hidden">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 italic">
            <p>Você ainda não possui tasks :(</p>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2 space-y-4 max-h-full h-full custom-scrollbar">
            {Object.entries(grouped).map(([date, tasksForDate]) => (
              <div key={date} className="flex flex-col gap-2">
                <div 
                  className="sticky top-0 z-10 py-1 backdrop-blur-md"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--box-color, #ffffff) calc(var(--box-opacity, 1) * 100%), transparent)' }}
                >
                  <h2 className="font-bold text-sm opacity-80">{formatDate(date)}</h2>
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