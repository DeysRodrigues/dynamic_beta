import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
  Undo2, Lock, Unlock, PlusCircle, X, FileText,
   Grid, ListTodo, Timer,  Save
} from "lucide-react";
import { useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";

import { useDashboardStore } from "@/store/useDashboardStore";
import { getFormattedCurrentDate } from "@/utils/DateUtils";

// Widgets
import ProgressBox from "./boxes/ProgressBox";
import MetaTagsBox from "./boxes/MetaTagsBox";
import PomodoroBox from "./boxes/PomodoroBox";
import EmbeddedBox from "./boxes/EmbeddedBox";
import TagsBox from "./boxes/TagsBox";
import BoxTask from "./boxes/BoxTask";
import NotepadBox from "./boxes/NotepadBox";
import HabitTrackerBox from "./boxes/HabitTrackerBox";
import MiniCalendarBox from "./boxes/MiniCalendarBox";
import LayoutManagerModal from "./modals/LayoutManagerModal";
import PixelGardenBox from "./boxes/PixelGardenBox";
import ThemeBox from "./boxes/ThemeBox";
import RpgProfileBox from "./boxes/RpgProfileBox";
import BookTrackerBox from "./boxes/BookTrackerBox";
import MonthlyGoalsBox from "./boxes/MonthlyGoalsBox";
import AutomationBox from "./boxes/AutomationBox";
import QuickWorkoutBox from "./boxes/QuickWorkoutBox";
import CozyLibraryBox from "./boxes/CozyLibraryBox";
import CountdownBox from "./boxes/CountdownBox";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const { layouts, setLayouts, boxes, setBoxes, resetDashboard, addBox } = useDashboardStore();
  const [editMode, setEditMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  const renderBox = (id: string) => {
    const type = id.split("-")[0];
    switch (type) {
      case "tasks": return <BoxTask />;
      case "progress": return <ProgressBox />;
      case "metatags": return <MetaTagsBox />;
      case "pomodoro": return <PomodoroBox />;
      case "tags": return <TagsBox />;
      case "embedded": return <EmbeddedBox id={id} />;
      case "notepad": return <NotepadBox id={id} />;
      case "habit": return <HabitTrackerBox id={id} />;
      case "garden": return <PixelGardenBox />;
      case "theme": return <ThemeBox />;
      case "rpg": return <RpgProfileBox />;
      case "books": return <BookTrackerBox id={id} />;
      case "goals": return <MonthlyGoalsBox id={id} />;
      case "auto": return <AutomationBox id={id} />;
      case "workout": return <QuickWorkoutBox />;
      case "calendar": return <MiniCalendarBox />;
      case "library": return <CozyLibraryBox id={id} />;
      case "countdown": return <CountdownBox id={id} />;
      default: return null;
    }
  };

  const handleAddWidget = (type: string) => { addBox(type); setShowAddMenu(false); };

  const removeBox = (id: string) => {
    // Garante que setBoxes receba o array anterior de forma segura
    setBoxes((prev) => (prev || []).filter((box) => box !== id));
    
    setLayouts((prev) => ({
      ...prev,
      lg: (prev.lg || []).filter((item: Layout) => item.i !== id),
      md: (prev.md || []).filter((item: Layout) => item.i !== id),
      sm: (prev.sm || []).filter((item: Layout) => item.i !== id),
    }));
  };

  return (
    <div className="relative min-h-screen w-full pb-20">
      <LayoutManagerModal isOpen={showLayoutManager} onClose={() => setShowLayoutManager(false)} />

      {/* --- BARRA PADRONIZADA (HOME) --- */}
      <div className="bar-padrao mb-6">
        <span className="font-bold text-lg">
          {getFormattedCurrentDate()}
        </span>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          
          <button
            onClick={() => setShowLayoutManager(true)}
            className="flex items-center gap-2 bg-background/20 border border-current/20 px-4 py-2 rounded-full font-semibold hover:bg-current/10 transition shadow-sm text-sm"
            title="Salvar layout e tema atual"
          >
            <Save size={18} /> Salvar
          </button>

          <button
            onClick={() => setShowLayoutManager(true)}
            className="flex items-center gap-2 bg-background/20 border border-current/20 px-4 py-2 rounded-full font-semibold hover:bg-current/10 transition shadow-sm text-sm"
          >
            <Grid size={18} /> Meus Setups
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:opacity-90 transition shadow-sm text-sm"
            >
              <PlusCircle size={18} /> Add Widget
            </button>

            {showAddMenu && (
              <div className="absolute top-full mt-2 right-0 bg-background rounded-xl shadow-xl border p-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 grid grid-cols-1 gap-1 max-h-[80vh] overflow-y-auto custom-scrollbar text-foreground">
                <p className="text-xs font-bold text-muted-foreground px-3 py-2 uppercase tracking-wider bg-muted/50 mt-1">Essenciais</p>
                <button onClick={() => handleAddWidget("tasks")} className="menu-item"><ListTodo size={16} className="text-emerald-500" /> Tarefas</button>
                <button onClick={() => handleAddWidget("pomodoro")} className="menu-item"><Timer size={16} className="text-red-500" /> Pomodoro</button>
                <button onClick={() => handleAddWidget("notepad")} className="menu-item"><FileText size={16} className="text-yellow-500" /> Notas</button>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-l border-current/20 pl-4">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className={`p-2 rounded-full transition ${editMode ? "bg-amber-100 text-amber-600" : "hover:bg-current/10"}`}
              title={editMode ? "Bloquear layout" : "Editar layout"}
            >
              {editMode ? <Unlock size={18} /> : <Lock size={18} />}
            </button>

            <button
              onClick={() => { if (window.confirm("Resetar layout?")) resetDashboard(); }}
              className="p-2 rounded-full hover:bg-current/10 transition"
              title="Resetar Padrão"
            >
              <Undo2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 480 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        rowHeight={100}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={(_layout, allLayouts) => setLayouts(allLayouts)}
        draggableCancel=".no-drag"
        margin={[16, 16]}
      >
        {/* CORREÇÃO DO ERRO AQUI: (boxes || []).map(...) previne o crash se boxes for undefined */}
        {(boxes || []).map((boxId) => {
          const component = renderBox(boxId);
          if (!component) return null;
          return (
            <div key={boxId} className={`h-full w-full transition-all duration-200 relative group ${editMode ? "border-2 border-dashed border-amber-400/50 rounded-2xl bg-amber-50/30 cursor-grab active:cursor-grabbing shadow-lg z-10" : ""}`}>
              {editMode && (
                <div className="absolute -top-3 -right-3 z-50 animate-in zoom-in duration-200">
                  <button onClick={(e) => { e.stopPropagation(); removeBox(boxId); }} className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-all cursor-pointer border-2 border-white"><X size={16} strokeWidth={3} /></button>
                </div>
              )}
              <div className={`w-full h-full overflow-hidden ${editMode ? "pointer-events-none select-none opacity-80" : ""}`}>{component}</div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}