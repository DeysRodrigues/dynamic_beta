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
  const [isExpanded, setIsExpanded] = useState(false);
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
        "group relative flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl shadow-sm transition-all duration-200",
        "bg-black/5 border-current/10 hover:bg-black/10 w-full",
        showMenu && "z-30 shadow-md",
        isExpanded && "bg-black/[0.07]"
      )}
    >
      
      {/* Checkbox: Clica para marcar/desmarcar */}
      {onToggle && (
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded-md transition-all shrink-0 mt-0.5",
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
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {task.time && (
            <span className={cn(
              "text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0",
              task.completed ? "opacity-50 line-through" : "bg-current/10 border-current/10"
            )}>
              {task.time}
            </span>
          )}
          
          <div 
            className="flex-1 min-w-0"
            onClick={() => !editable && setIsExpanded(!isExpanded)}
          >
            {editable ? (
              <input
                type="text"
                autoFocus
                value={task.description}
                onChange={(e) => onChange?.(task.id, "description", e.target.value)}
                onBlur={() => setShowMenu(false)}
                className={cn(
                  "bg-transparent outline-none w-full text-xs sm:text-sm transition-colors cursor-text min-w-0",
                  task.completed ? "opacity-50 line-through" : "font-medium",
                  "border-b border-current focus:border-primary"
                )}
              />
            ) : (
              <div className={cn(
                "text-xs sm:text-sm transition-colors cursor-pointer min-w-0 break-words",
                task.completed ? "opacity-50 line-through" : "font-medium",
                !isExpanded && "truncate"
              )}>
                {task.description}
              </div>
            )}
          </div>
          
          {/* Tags em modo colapsado */}
          {!isExpanded && !editable && (
            <div className="flex items-center gap-1.5 shrink-0">
              {task.tag && (
                <span className="text-[9px] sm:text-[10px] opacity-70 bg-current/5 px-2 py-0.5 rounded-full border border-current/10 max-w-[60px] sm:max-w-[80px] truncate hidden xs:block">
                  {task.tag}
                </span>
              )}
              {task.groupTag && (
                 <span className="hidden md:inline-flex text-[9px] uppercase tracking-wider opacity-60 bg-current/5 px-1.5 py-0.5 rounded border border-current/10 whitespace-nowrap">
                   {task.groupTag}
                 </span>
              )}
            </div>
          )}
        </div>

        {/* Tags e Info Extra em modo expandido */}
        {isExpanded && !editable && (
          <div className="flex flex-wrap gap-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {task.tag && (
              <span className="text-[9px] sm:text-[10px] opacity-70 bg-current/5 px-2 py-0.5 rounded-full border border-current/10">
                {task.tag}
              </span>
            )}
            {task.groupTag && (
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider opacity-60 bg-current/5 px-2 py-0.5 rounded border border-current/10">
                {task.groupTag}
              </span>
            )}
            {task.date && (
              <span className="text-[9px] sm:text-[10px] opacity-50 font-medium">
                {task.date}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Menu de Opções */}
      <div className="relative shrink-0" ref={menuRef}>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className={cn(
            "p-1.5 hover:bg-current/10 rounded-lg transition-all",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
            showMenu && "bg-current/10 opacity-100"
          )}
          title="Opções"
        >
          <MoreHorizontal size={18} />
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