import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Grid, ListTodo, Plus, Save, ShoppingBag, Timer } from "lucide-react";

interface AddWidgetMenuProps {
  onAddWidget: (type: string) => void;
  /** Opens the layout manager, where setups are saved and loaded. */
  onBackup: () => void;
}

/** The "Adicionar" button and its dropdown with quick widgets and shortcuts. */
export function AddWidgetMenu({ onAddWidget, onBackup }: AddWidgetMenuProps) {
  const [showOpen, setShowOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setShowOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    e.preventDefault();
    onAddWidget(type);
    setShowOpen(false);
  };

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(path);
    setShowOpen(false);
  };

  const openModal = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    setShowOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowOpen(!showOpen)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        <Plus size={16} strokeWidth={3} />{" "}
        <span className="hidden sm:inline">Adicionar</span>
      </button>
      
      {/* MENU DROPDOWN "VIDRO" */}
      {showOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl p-2 z-[999] animate-in fade-in zoom-in-95 origin-top-right overflow-hidden ring-1 ring-black/5"
          style={{
            backgroundColor: "var(--box-color)",
            color: "var(--box-text-color)",
          }}
        >
          <div className="text-[10px] font-bold uppercase opacity-50 px-2 py-1 tracking-wider mb-1">
            Rápidos
          </div>
          <div className="space-y-1">
            {[
              {
                id: "tasks",
                label: "Tarefas",
                icon: ListTodo,
                color: "text-emerald-500",
              },
              {
                id: "pomodoro",
                label: "Pomodoro",
                icon: Timer,
                color: "text-red-500",
              },
              {
                id: "notepad",
                label: "Notas",
                icon: FileText,
                color: "text-yellow-500",
              },
              {
                id: "calendar",
                label: "Calendário",
                icon: Grid,
                color: "text-blue-500",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={(e) => handleAdd(e, item.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-current/10 transition text-xs font-medium group text-left"
              >
                <item.icon size={14} className={item.color} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="my-2"></div>

          <button
            onClick={handleNavigate("/store")}
            className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all mb-2 shadow-sm"
          >
            <ShoppingBag size={14} /> Loja Completa{" "}
            <ArrowRight size={12} />
          </button>

          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={openModal(onBackup)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-current/10 text-[10px] font-bold opacity-70 hover:opacity-100 transition bg-current/5"
            >
              <Save size={14} /> Backup
            </button>
            <button
              onClick={handleNavigate("/themes")}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-current/10 text-[10px] font-bold opacity-70 hover:opacity-100 transition bg-current/5"
            >
              <Grid size={14} /> Temas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
