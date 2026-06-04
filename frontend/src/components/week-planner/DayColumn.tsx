import { memo } from "react";
import { Plus, Edit3, Calendar } from "lucide-react";
import SpotlightCard from "@/components/landing/SpotlightCard";
import TaskItem from "@/components/ui/TaskItem";
import { formatDate, getTodayDate } from "@/utils/DateUtils";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/Task";

interface DayColumnProps {
  date: string;
  tasks: Task[];
  filter: "all" | "pending" | "completed";
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddModal: (date: string) => void;
  onBulkEdit: (date: string) => void;
  onDropTask: (taskId: string, newDate: string) => void;
}

function DayColumnComponent({
  date,
  tasks,
  filter,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onAddModal,
  onBulkEdit,
  onDropTask
}: DayColumnProps) {
  const isToday = date === getTodayDate();
  const isPast = date < getTodayDate();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDropTask(taskId, date);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = filteredTasks.filter(t => t.completed).length;

  return (
    <SpotlightCard 
      className={cn(
        "box-padrao min-w-[320px] md:min-w-[360px] snap-center overflow-hidden border-none shadow-2xl p-0 gap-0 transition-opacity",
        isPast ? "opacity-70" : "opacity-100"
      )}
      spotlightColor="color-mix(in srgb, var(--primary) 20%, transparent)"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col h-[65vh]">
        {/* Day Header */}
        <div className={cn(
          "p-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl",
          isToday ? "bg-primary/10" : "bg-current/[0.04]"
        )}>
          <div className="flex flex-col">
            <span className={cn(
              "font-black capitalize text-xl tracking-tighter flex items-center gap-2",
              isToday ? "text-primary" : "opacity-90"
            )}>
              {new Date(date + "T00:00").toLocaleDateString("pt-BR", { weekday: "long" })}
              <span className="text-[10px] bg-current/10 px-2 py-0.5 rounded-full opacity-50 font-black">
                {filteredTasks.length}
              </span>
            </span>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-0.5">
              {formatDate(date)} {isToday && "• HOJE"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onBulkEdit(date)}
              className="p-2.5 rounded-xl hover:bg-current/10 transition-colors opacity-30 hover:opacity-100"
              title="Editar em massa"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onAddModal(date)}
              className="p-2.5 bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
              title="Adicionar tarefa"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Day Tasks */}
        <div className="p-4 pt-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
              <Calendar size={48} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6">Sem Tarefas</p>
            </div>
          )}
        </div>

        {/* Day Footer Stat */}
        {filteredTasks.length > 0 && (
          <div className="px-6 py-4 bg-current/[0.03] text-[9px] font-black uppercase tracking-[0.2em] opacity-30 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                Frequência
              </span>
              <span className="bg-current/10 px-2 py-0.5 rounded-md">
                {completedCount}/{filteredTasks.length}
              </span>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

export const DayColumn = memo(DayColumnComponent);
