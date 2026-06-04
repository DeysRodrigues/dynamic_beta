import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { DayColumn } from "./DayColumn";
import type { Task } from "@/types/Task";

interface WeekGridProps {
  weekDays: string[];
  tasksByDate: Record<string, Task[]>;
  filter: "all" | "pending" | "completed";
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddModal: (date: string) => void;
  onBulkEdit: (date: string) => void;
  onDropTask: (taskId: string, newDate: string) => void;
}

export function WeekGrid({
  weekDays,
  tasksByDate,
  filter,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onAddModal,
  onBulkEdit,
  onDropTask
}: WeekGridProps) {
  const [hideEmptyDays, setHideEmptyDays] = useState(false);

  const visibleDays = hideEmptyDays 
    ? weekDays.filter(date => (tasksByDate[date]?.length || 0) > 0)
    : weekDays;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setHideEmptyDays(!hideEmptyDays)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
        >
          {hideEmptyDays ? <Eye size={14} /> : <EyeOff size={14} />}
          {hideEmptyDays ? "Mostrar dias vazios" : "Recolher dias vazios"}
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 snap-x no-scrollbar mask-gradient-right">
        {visibleDays.map((date) => (
          <DayColumn
            key={date}
            date={date}
            tasks={tasksByDate[date] || []}
            filter={filter}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onAddModal={onAddModal}
            onBulkEdit={onBulkEdit}
            onDropTask={onDropTask}
          />
        ))}
      </div>
    </div>
  );
}
