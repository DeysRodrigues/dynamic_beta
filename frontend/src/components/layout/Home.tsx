import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
  Lock,
  Unlock,
  FileText,
  Grid,
  ListTodo,
  Timer,
  Save,
  Loader2,
  Plus,
  X,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Layout,
  ShoppingBag,
  ArrowRight,
  GripVertical,
  Trash2,
  Target,
} from "lucide-react";
import React, {
  useState,
  Suspense,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Responsive, WidthProvider, type Layouts } from "react-grid-layout";
import { useShallow } from "zustand/react/shallow";
import { useNavigate } from "react-router-dom";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useUserStore } from "@/store/useUserStore";
import { getFormattedCurrentDate } from "@/utils/DateUtils";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/landing/ShinyText";

import LayoutManagerModal from "./modals/LayoutManagerModal";
import RiskTrackerBox from "./boxes/RiskTrackerBox";
import PresenceCalendarBox from "./boxes/PresenceCalendarBox";
import ActivityGoalsBox from "./boxes/ActivityGoalsBox";


// --- LAZY LOADING ---
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
const CodeSnippetBox = React.lazy(() => import("./boxes/CodeSnippetBox"));
const QuickLinksBox = React.lazy(() => import("./boxes/QuickLinksBox"));
const ThreeFrogsBox = React.lazy(() => import("./boxes/ThreeFrogsBox"));
const ProjectOverviewBox = React.lazy(() => import("./boxes/ProjectOverviewBox"));

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- COMPONENTES VISUAIS ---

const BoxLoader = React.memo(() => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-current/5 animate-pulse rounded-2xl backdrop-blur-sm">
    <Loader2 className="w-6 h-6 animate-spin opacity-50" />
    <span className="text-[10px] font-bold opacity-40 mt-2 uppercase tracking-widest">
      Carregando...
    </span>
  </div>
));

// --- WORKSPACE TABS ---
const WorkspaceTabs = React.memo(() => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    addWorkspace,
    removeWorkspace,
    renameWorkspace,
  } = useDashboardStore(
    useShallow((state) => ({
      workspaces: state.workspaces,
      activeWorkspaceId: state.activeWorkspaceId,
      setActiveWorkspace: state.setActiveWorkspace,
      addWorkspace: state.addWorkspace,
      removeWorkspace: state.removeWorkspace,
      renameWorkspace: state.renameWorkspace,
    }))
  );

  const { projects, activeProjectId, setActiveProject } = useProjectStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = useCallback(() => {
    const name = prompt("Nome da nova área (ex: Estudos):", "Nova Área");
    if (name) addWorkspace(name);
  }, [addWorkspace]);

  const startRename = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  }, []);

  const saveRename = useCallback(
    (id: string) => {
      if (editName.trim()) {
        renameWorkspace(id, editName);
      }
      setEditingId(null);
    },
    [editName, renameWorkspace]
  );

  const handleSelectWorkspace = (id: string) => {
    setActiveProject(null);
    setActiveWorkspace(id);
  };

  const handleSelectProject = (id: string) => {
    setActiveProject(id);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full pb-1 mask-gradient-right">
      {/* Workspaces Normais */}
      {workspaces.map((w) => {
        const isActive = activeWorkspaceId === w.id && !activeProjectId;
        const isEditing = editingId === w.id;

        if (isEditing) {
          return (
            <div
              key={w.id}
              className="flex items-center bg-current/10 rounded-xl px-2 py-1.5"
            >
              <input
                autoFocus
                className="w-24 bg-transparent text-sm font-bold outline-none text-inherit"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveRename(w.id)}
                onBlur={() => saveRename(w.id)}
              />
            </div>
          );
        }

        return (
          <div key={w.id} className="group relative flex items-center">
            <button
              onClick={() => handleSelectWorkspace(w.id)}
              onDoubleClick={() => startRename(w.id, w.name)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 select-none whitespace-nowrap",
                isActive
                  ? "bg-current/10 shadow-sm opacity-100"
                  : "opacity-60 hover:opacity-100 hover:bg-current/5"
              )}
            >
              {isActive && <Layout size={14} className="opacity-70" />}
              {w.name}
            </button>

            {workspaces.length > 1 && isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Excluir este workspace?")) removeWorkspace(w.id);
                }}
                className={cn(
                  "absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 transition-all shadow-sm z-10",
                  "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-90 sm:scale-75 sm:hover:scale-100"
                )}
                title="Excluir Workspace"
              >
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </div>
        );
      })}

      {/* Projetos Ativos */}
      {projects.filter(p => p.status === 'active').map((p) => {
        const isActive = activeProjectId === p.id;
        return (
          <div key={p.id} className="group relative flex items-center">
            <button
              onClick={() => handleSelectProject(p.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 select-none whitespace-nowrap border border-current/10",
                isActive
                  ? "bg-primary/20 border-primary shadow-sm opacity-100"
                  : "opacity-60 hover:opacity-100 hover:bg-current/5"
              )}
            >
              <Target size={14} className={cn(isActive ? "text-primary" : "opacity-40")} />
              {p.name}
            </button>
          </div>
        );
      })}

      <button
        onClick={handleAdd}
        className="p-2 rounded-xl opacity-40 hover:opacity-100 hover:bg-current/10 transition-all"
        title="Nova Aba"
      >
        <Plus size={16} />
      </button>
    </div>
  );
});

// --- HEADER PRINCIPAL ---
interface DashboardHeaderProps {
  onSave: () => void;
  onSetups?: () => void;
  onReset?: () => void;
  editMode: boolean;
  toggleEditMode: () => void;
  onAddWidget: (type: string) => void;
}

const DashboardHeader = React.memo(
  ({
    onSave,
    editMode,
    toggleEditMode,
    onAddWidget,
  }: DashboardHeaderProps) => {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { name, avatar } = useUserStore(
      useShallow((state) => ({ name: state.name, avatar: state.avatar }))
    );
    const { isFocusMode, toggleFocusMode } = useDashboardStore(
      useShallow((s) => ({
        isFocusMode: s.isFocusMode,
        toggleFocusMode: s.toggleFocusMode,
      }))
    );

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12)
        return {
          text: "Bom dia",
          icon: <Sun size={14} className="text-orange-400" />,
        };
      if (hour < 18)
        return {
          text: "Boa tarde",
          icon: <Sun size={14} className="text-amber-500" />,
        };
      return {
        text: "Boa noite",
        icon: <Moon size={14} className="text-indigo-400" />,
      };
    };
    const greeting = getGreeting();

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node))
          setShowAddMenu(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Atalhos
    useEffect(() => {
      const handleKeys = (e: KeyboardEvent) => {
        if (
          e.key.toLowerCase() === "f" &&
          !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
        ) {
          toggleFocusMode();
        }
        if (e.key === "Escape" && isFocusMode) toggleFocusMode();
      };
      window.addEventListener("keydown", handleKeys);
      return () => window.removeEventListener("keydown", handleKeys);
    }, [isFocusMode, toggleFocusMode]);

    // HANDLERS SEGUROS
    const handleAdd = (e: React.MouseEvent, type: string) => {
      e.stopPropagation();
      e.preventDefault();
      // Gera ID único aqui para garantir criação
      const uniqueId = `${type}-${crypto.randomUUID().slice(0, 8)}`;
      onAddWidget(uniqueId);
      setShowAddMenu(false);
    };

    const handleNavigate = (path: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(path);
      setShowAddMenu(false);
    };

    const openModal = (action: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      action();
      setShowAddMenu(false);
    };

    return (
      <div
        className={`flex flex-col gap-4 mb-8 transition-all duration-500 relative z-50 ${isFocusMode ? "opacity-30 hover:opacity-100" : ""
          }`}
        style={{ color: "var(--box-text-color)" }}
      >
        {/* Row 1: Greeting & Controls */}
        <div className="flex items-center justify-between gap-2">
          {isFocusMode ? (
            <button
              onClick={toggleFocusMode}
              className="bg-amber-500/20 text-amber-500 p-2.5 rounded-xl flex items-center gap-2 text-xs font-black animate-pulse hover:bg-amber-500 hover:text-white transition shadow-lg shadow-amber-500/10 uppercase tracking-tighter"
            >
              <EyeOff size={16} /> SAIR DO FOCO
            </button>
          ) : (
            <>
              {/* Avatar & Greeting */}
              <div className="flex items-center gap-3 sm:gap-4 animate-in slide-in-from-left-2 duration-300 min-w-0">
                <div className="relative shrink-0 ml-14 md:ml-0 group cursor-pointer" onClick={() => navigate("/wiki")}>
                  <img
                    src={
                      avatar ||
                      "https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg"
                    }
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-xl border-2 border-current/10 group-hover:border-primary transition-all duration-500"
                    alt="Avatar"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full shadow-md">
                    {greeting.icon}
                  </div>
                </div>
                <div className="min-w-0 hidden xs:block">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">
                    Dashboard • {getFormattedCurrentDate()}
                  </div>
                  <h1 className="text-base sm:text-xl font-black leading-tight truncate tracking-tight">
                    {greeting.text},{" "}
                    <ShinyText text={name.split(" ")[0]} disabled={false} speed={3} className="text-primary" />
                  </h1>
                </div>
              </div>

              {/* Controls Group */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-md border transition-colors duration-500"
                   style={{ 
                      backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
                   }}>
                <button
                  onClick={toggleFocusMode}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    isFocusMode ? "bg-primary text-primary-foreground shadow-lg" : "opacity-40 hover:opacity-100 hover:bg-current/10"
                  )}
                  title="Modo Foco (F)"
                >
                  {isFocusMode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  onClick={toggleEditMode}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    editMode
                      ? "bg-amber-500/20 text-amber-600 shadow-inner ring-1 ring-amber-500/30"
                      : "opacity-40 hover:opacity-100 hover:bg-current/10"
                  )}
                  title="Editar Layout"
                >
                  {editMode ? <Unlock size={18} /> : <Lock size={18} />}
                </button>

                <div className="w-px h-5 mx-1 opacity-10" style={{ backgroundColor: 'var(--box-text-color)' }}></div>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    <Plus size={16} strokeWidth={3} />{" "}
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
                  
                  {/* ... resto do dropdown ... */}

                  {/* MENU DROPDOWN "VIDRO" */}
                  {showAddMenu && (
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

                      <div className="border-t border-current/10 my-2"></div>

                      <button
                        onClick={handleNavigate("/store")}
                        className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all mb-2 shadow-sm"
                      >
                        <ShoppingBag size={14} /> Loja Completa{" "}
                        <ArrowRight size={12} />
                      </button>

                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={openModal(onSave)}
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
              </div>
            </>
          )}
        </div>

        {/* Row 2: Tabs (Centered on desktop, scrollable on mobile) */}
        {!isFocusMode && (
          <div className="w-full flex justify-center animate-in slide-in-from-bottom-2 duration-500">
            <WorkspaceTabs />
          </div>
        )}
      </div>
    );
  }
);

// --- MAIN COMPONENT ---

export default function Dashboard() {
  const workspaces = useDashboardStore((state) => state.workspaces);
  const activeWorkspaceId = useDashboardStore(
    (state) => state.activeWorkspaceId
  );
  
  const { projects, activeProjectId, updateProjectLayout, addBoxToProject, removeBoxFromProject } = useProjectStore();

  const addBox = (type: string) => {
    if (activeProjectId) {
      addBoxToProject(activeProjectId, type);
    } else {
      addBoxWs(type);
    }
  };

  const removeBox = (id: string) => {
    if (activeProjectId) {
      removeBoxFromProject(activeProjectId, id);
    } else {
      removeBoxWs(id);
    }
  };
  
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeWorkspace = activeProject 
    ? { id: activeProject.id, name: activeProject.name, layouts: activeProject.layouts, boxes: activeProject.boxes }
    : workspaces.find((w) => w.id === activeWorkspaceId);

  const { setLayouts, resetDashboard, addBox: addBoxWs, removeBox: removeBoxWs } = useDashboardStore(
    useShallow((state) => ({
      setLayouts: state.setLayouts,
      resetDashboard: state.resetDashboard,
      addBox: state.addBox,
      removeBox: state.removeBox,
    }))
  );

  const [editMode, setEditMode] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  const handleSave = useCallback(() => setShowLayoutManager(true), []);
  const handleSetups = useCallback(() => setShowLayoutManager(true), []);
  const handleReset = useCallback(() => {
    if (window.confirm("Resetar este workspace para o padrão?"))
      resetDashboard();
  }, [resetDashboard]);
  const handleToggleEdit = useCallback(() => setEditMode((p) => !p), []);

  const handleLayoutChange = (_layout: unknown, allLayouts: Layouts) => {
    if (activeProjectId) {
      updateProjectLayout(activeProjectId, allLayouts);
    } else {
      setLayouts(allLayouts);
    }
  };

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
      case "snippet":
        return <CodeSnippetBox id={id} />;
      case "quicklinks":
        return <QuickLinksBox id={id} />;
      case "risk":
        return <RiskTrackerBox id={id} />;
      case "presence":
        return <PresenceCalendarBox id={id} />;
      case "activity":
        return <ActivityGoalsBox id={id} />;
      case "three_frogs":
        return <ThreeFrogsBox id={id} />;
      case "project_overview":
        return <ProjectOverviewBox projectId={activeProjectId!} />;
      default:
        return null;
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BoxLoader />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full pb-20"
      style={{ color: "var(--box-text-color)" }}
    >
      <LayoutManagerModal
        isOpen={showLayoutManager}
        onClose={() => setShowLayoutManager(false)}
      />

      <DashboardHeader
        onSave={handleSave}
        onSetups={handleSetups}
        onReset={handleReset}
        editMode={editMode}
        toggleEditMode={handleToggleEdit}
        onAddWidget={addBox}
      />

      <ResponsiveGridLayout
        key={activeProject ? activeProject.id : activeWorkspaceId}
        className="layout"
        layouts={activeWorkspace.layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 480, xs: 0 }}
        cols={{ lg: 4, md: 2, sm: 1, xs: 1 }}
        rowHeight={100}
        isDraggable={editMode}
        isResizable={editMode}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
        draggableCancel=".no-drag"
        margin={[12, 12]}
        containerPadding={[0, 0]}
      >
        {(activeWorkspace.boxes || []).map((boxId) => {
          const component = renderBox(boxId);
          if (!component) return null;

          return (
            <div
              key={boxId}
              className={cn(
                "h-full w-full transition-all duration-300 relative group rounded-2xl overflow-hidden",
                editMode && "ring-2 ring-amber-500/50 shadow-xl z-10 bg-current/5"
              )}
            >
              {editMode && (
                <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between p-2 bg-amber-500/20 backdrop-blur-md border-b border-amber-500/20 animate-in slide-in-from-top duration-200">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-amber-500/30 rounded-lg transition-colors">
                    <GripVertical size={18} className="text-amber-600" />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter hidden sm:inline px-2">
                      {boxId.split("-")[0]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Remover este widget deste workspace?"))
                          removeBox(boxId);
                      }}
                      className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-white p-1.5 rounded-lg transition-all cursor-pointer no-drag"
                      title="Remover Widget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  "w-full h-full overflow-hidden rounded-2xl",
                  editMode && "pointer-events-none select-none opacity-40 pt-10"
                )}
              >
                <Suspense fallback={<BoxLoader />}>{component}</Suspense>
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}