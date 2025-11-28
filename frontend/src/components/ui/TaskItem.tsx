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

  // Fecha o menu ao clicar fora
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
    <div className="group relative flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* Checkbox */}
      {onToggle && (
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full border transition-all shrink-0",
            task.completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-gray-50 border-gray-300 hover:border-indigo-400"
          )}
        >
          {task.completed && <Check size={12} strokeWidth={3} />}
        </button>
      )}

      {/* Info Principal */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {task.time && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap",
            task.completed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-600 border-gray-200"
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
            "bg-transparent outline-none w-full text-sm truncate transition-colors",
            task.completed ? "text-gray-400 line-through decoration-gray-300" : "text-gray-700 font-medium",
            editable && "border-b border-gray-300 focus:border-indigo-500"
          )}
        />
        
        {task.groupTag && (
           <span className="hidden sm:inline-flex text-[9px] uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
             {task.groupTag}
           </span>
        )}
      </div>

      {/* Tag Específica */}
      {task.tag && !editable && (
        <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 max-w-[80px] truncate hidden sm:block">
          {task.tag}
        </span>
      )}

      {/* Menu de Opções (Singelo) */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition opacity-100 sm:opacity-0 group-hover:opacity-100"
          title="Opções"
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <div className="flex flex-col p-1">
              {onEdit && (
                <button 
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition text-left"
                >
                  <Edit2 size={14} /> Editar
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => { onDelete(task.id); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition text-left"
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