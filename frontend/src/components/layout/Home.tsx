import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
  Undo2,
  Lock,
  Unlock,
  PlusCircle,
  X,
  FileText,
  Grid,
  ListTodo,
  Timer,
  Save,
  Loader2,
} from "lucide-react";
import React, { useState, Suspense } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useShallow } from "zustand/react/shallow";

import { useDashboardStore } from "@/store/useDashboardStore";
import { getFormattedCurrentDate } from "@/utils/DateUtils";
import LayoutManagerModal from "./modals/LayoutManagerModal";

// --- 1. LAZY LOADING DOS WIDGETS ---
// O navegador só baixa o código do widget se ele estiver na tela
const ProgressBox = React.lazy(() => import("./boxes/ProgressBox"));
const MetaTagsBox = React.lazy(() => import("./boxes/MetaTagsBox"));
const PomodoroBox = React.lazy(() => import("./boxes/PomodoroBox"));
const EmbeddedBox = React.lazy(() => import("./boxes/EmbeddedBox"));
const TagsBox = React.lazy(() => import("./boxes/TagsBox"));
const BoxTask = React.lazy(() => import("./boxes/BoxTask"));
const NotepadBox = React.lazy(() => import("./boxes/NotepadBox"));
const HabitTrackerBox = React.lazy(() => import("./boxes/HabitTrackerBox"));
const MiniCalendarBox = React.lazy(() => import("./boxes/MiniCalendarBox"));
const PixelGardenBox = React.lazy(() => import("./boxes/PixelGardenBox"));
const ThemeBox = React.lazy(() => import("./boxes/ThemeBox"));
const RpgProfileBox = React.lazy(() => import("./boxes/RpgProfileBox"));
const BookTrackerBox = React.lazy(() => import("./boxes/BookTrackerBox"));
const MonthlyGoalsBox = React.lazy(() => import("./boxes/MonthlyGoalsBox"));
const AutomationBox = React.lazy(() => import("./boxes/AutomationBox"));
const QuickWorkoutBox = React.lazy(() => import("./boxes/QuickWorkoutBox"));
const CozyLibraryBox = React.lazy(() => import("./boxes/CozyLibraryBox"));
const CountdownBox = React.lazy(() => import("./boxes/CountdownBox"));

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- 2. COMPONENTES AUXILIARES ---

// Skeleton de carregamento, para carreganto das boxes
const BoxLoader = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 animate-pulse rounded-2xl border border-current/5">
    <Loader2 className="w-6 h-6 animate-spin opacity-50" />
    <span className="text-[10px] font-bold opacity-40 mt-2 uppercase tracking-widest">
      Carregando...
    </span>
  </div>
);

// Header Memoizado (Previne que a barra pisque ao renderizar o grid)
const DashboardHeader = React.memo(
  ({
    onSave,
    onSetups,
    onReset,
    editMode,
    toggleEditMode,
    onAddWidget,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any) => {
    const [showAddMenu, setShowAddMenu] = useState(false);

    return (
      <div className="bar-padrao mb-6">
        <span className="font-bold text-lg">{getFormattedCurrentDate()}</span>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-background/20 border border-current/20 px-4 py-2 rounded-full font-semibold hover:bg-current/10 transition shadow-sm text-sm"
            title="Salvar layout e tema atual"
          >
            <Save size={18} /> Salvar
          </button>

          <button
            onClick={onSetups}
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
                <p className="text-xs font-bold text-muted-foreground px-3 py-2 uppercase tracking-wider bg-muted/50 mt-1">
                  Essenciais
                </p>
                <button
                  onClick={() => {
                    onAddWidget("tasks");
                    setShowAddMenu(false);
                  }}
                  className="menu-item"
                >
                  <ListTodo size={16} className="text-emerald-500" /> Tarefas
                </button>
                <button
                  onClick={() => {
                    onAddWidget("pomodoro");
                    setShowAddMenu(false);
                  }}
                  className="menu-item"
                >
                  <Timer size={16} className="text-red-500" /> Pomodoro
                </button>
                <button
                  onClick={() => {
                    onAddWidget("notepad");
                    setShowAddMenu(false);
                  }}
                  className="menu-item"
                >
                  <FileText size={16} className="text-yellow-500" /> Notas
                </button>
               
              </div>
            )}
          </div>

          <div className="flex gap-2 border-l border-current/20 pl-4">
            <button
              onClick={toggleEditMode}
              className={`p-2 rounded-full transition ${
                editMode ? "bg-amber-100 text-amber-600" : "hover:bg-current/10"
              }`}
              title={editMode ? "Bloquear layout" : "Editar layout"}
            >
              {editMode ? <Unlock size={18} /> : <Lock size={18} />}
            </button>

            <button
              onClick={onReset}
              className="p-2 rounded-full hover:bg-current/10 transition"
              title="Resetar Padrão"
            >
              <Undo2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// --- 3. COMPONENTE PRINCIPAL ---

export default function Dashboard() {
 
  const { layouts, setLayouts, boxes, resetDashboard, addBox, removeBox } =
    useDashboardStore(
      useShallow((state) => ({
        layouts: state.layouts,
        setLayouts: state.setLayouts,
        boxes: state.boxes,
        resetDashboard: state.resetDashboard,
        addBox: state.addBox,
        removeBox: state.removeBox,
      }))
    );

  const [editMode, setEditMode] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  // Função simples para mapear ID -> Componente
  const renderBox = (id: string) => {
    const type = id.split("-")[0];
    switch (type) {
      case "tasks":
        return <BoxTask />;
      case "progress":
        return <ProgressBox />;
      case "metatags":
        return <MetaTagsBox />;
      case "pomodoro":
        return <PomodoroBox />;
      case "tags":
        return <TagsBox />;
      case "embedded":
        return <EmbeddedBox id={id} />;
      case "notepad":
        return <NotepadBox id={id} />;
      case "habit":
        return <HabitTrackerBox id={id} />;
      case "garden":
        return <PixelGardenBox />;
      case "theme":
        return <ThemeBox />;
      case "rpg":
        return <RpgProfileBox />;
      case "books":
        return <BookTrackerBox id={id} />;
      case "goals":
        return <MonthlyGoalsBox id={id} />;
      case "auto":
        return <AutomationBox id={id} />;
      case "workout":
        return <QuickWorkoutBox />;
      case "calendar":
        return <MiniCalendarBox />;
      case "library":
        return <CozyLibraryBox id={id} />;
      case "countdown":
        return <CountdownBox id={id} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full pb-20">
      <LayoutManagerModal
        isOpen={showLayoutManager}
        onClose={() => setShowLayoutManager(false)}
      />

      {/* Header Memoizado */}
      <DashboardHeader
        onSave={() => setShowLayoutManager(true)}
        onSetups={() => setShowLayoutManager(true)}
        onReset={() => {
          if (window.confirm("Resetar layout?")) resetDashboard();
        }}
        editMode={editMode}
        toggleEditMode={() => setEditMode((prev) => !prev)}
        onAddWidget={addBox}
      />

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
        {(boxes || []).map((boxId) => {
          const component = renderBox(boxId);
          if (!component) return null;

          return (
            <div
              key={boxId}
              className={`h-full w-full transition-all duration-200 relative group ${
                editMode
                  ? "border-2 border-dashed border-amber-400/50 rounded-2xl bg-amber-50/30 cursor-grab active:cursor-grabbing shadow-lg z-10"
                  : ""
              }`}
            >
              {/* Botão de Remover (Só aparece no Edit Mode) */}
              {editMode && (
                <div className="absolute -top-3 -right-3 z-50 animate-in zoom-in duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Remover este widget?")) removeBox(boxId); // Chama a função atômica
                    }}
                    className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-all cursor-pointer border-2 border-white"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              )}

              <div
                className={`w-full h-full overflow-hidden ${
                  editMode ? "pointer-events-none select-none opacity-80" : ""
                }`}
              >
                {/* Suspense para o Lazy Loading */}
                <Suspense fallback={<BoxLoader />}>{component}</Suspense>
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
