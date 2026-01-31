import { useState, useRef, useEffect } from "react";
import { Trash2, Edit2, MoreHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/Task";

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onChange?: (id: string, field: keyof Task, value: string) => void;
  editable?: boolean;
  compact?: boolean;
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  onChange,
  editable = false,
}: TaskItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl shadow-sm transition-all duration-200",
        "bg-black/5 border-current/10 hover:bg-black/10"
      )}
    >
      
      {/* Checkbox: Clica para marcar/desmarcar */}
      {onToggle && (
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded-md transition-all shrink-0",
            task.completed
              ? "bg-green-500 text-white shadow-sm scale-110" 
              : "border-2 border-current/30 hover:border-current/60 hover:scale-105"
          )}
          title={task.completed ? "Marcar como não concluída" : "Concluir tarefa"}
        >
          {task.completed && <Check size={14} strokeWidth={4} />}
        </button>
      )}

      {/* Info Principal */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {task.time && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap",
            task.completed ? "opacity-50 line-through" : "bg-current/10 border-current/10"
          )}>
            {task.time}
          </span>
        )}
        
        <input
          type="text"
          value={task.description}
          onChange={(e) => editable && onChange?.(task.id, "description", e.target.value)}
          readOnly={!editable}
          className={cn(
            "bg-transparent outline-none w-full text-sm truncate transition-colors cursor-default",
            task.completed ? "opacity-50 line-through" : "font-medium",
            editable && "border-b border-current focus:border-primary cursor-text"
          )}
        />
        
        {task.groupTag && (
           <span className="hidden sm:inline-flex text-[9px] uppercase tracking-wider opacity-60 bg-current/5 px-1.5 py-0.5 rounded border border-current/10 whitespace-nowrap">
             {task.groupTag}
           </span>
        )}
      </div>

      {/* Tag Específica */}
      {task.tag && !editable && (
        <span className="text-[10px] opacity-70 bg-current/5 px-2 py-1 rounded-full border border-current/10 max-w-[80px] truncate hidden sm:block">
          {task.tag}
        </span>
      )}

      {/* Menu de Opções */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-current/10 rounded-lg transition"
          title="Opções"
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-popover rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <div className="flex flex-col p-1">
              {onEdit && (
                <button 
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-lg transition text-left"
                >
                  <Edit2 size={14} /> Editar
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => { onDelete(task.id); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition text-left"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}