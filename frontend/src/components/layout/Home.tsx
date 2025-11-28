import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Trash, Undo2, Lock, Unlock } from "lucide-react";
import { useState, useRef } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";

// Imports da Store e Utils
import { useDashboardStore } from "@/store/useDashboardStore";
import { getFormattedCurrentDate } from "@/utils/DateUtils";

// Importação de TODOS os Boxes
import ProgressBox from "./boxes/ProgressBox";
import MetaTagsBox from "./boxes/MetaTagsBox";
import PomodoroBox from "./boxes/PomodoroBox";
import EmbeddedBox from "./boxes/EmbeddedBox";
import TagsBox from "./boxes/TagsBox";
import BoxTask from "./boxes/BoxTask";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const { layouts, setLayouts, boxes, setBoxes, resetDashboard } = useDashboardStore();
  const [editMode, setEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{ id: string; layout: Layout } | null>(null);

  // Ref para a lixeira (substitui o getElementById)
  const trashRef = useRef<HTMLDivElement>(null);

  // Mapa de componentes para renderizar dinamicamente
  const componentMap: Record<string, React.ReactNode> = {
    progress: <ProgressBox />,
    metatags: <MetaTagsBox />,
    pomodoro: <PomodoroBox />,
    embedded: <EmbeddedBox />,
    tags: <TagsBox />,
    tasks: <BoxTask />,
  };

  // Lógica de Remoção e Drag & Drop 

  const removeBox = (id: string) => {
    const layoutItem = layouts.lg.find((item: Layout) => item.i === id);
    if (layoutItem) {
      setLastRemoved({ id, layout: layoutItem });
    }
    setBoxes((prev) => prev.filter((box) => box !== id));
    
    // Atualiza o layout removendo o item
    setLayouts((prev) => ({
      ...prev,
      lg: prev.lg.filter((item: Layout) => item.i !== id),
    }));
  };

  const handleTrashClick = () => {
    if (lastRemoved && !boxes.includes(lastRemoved.id)) {
      setBoxes((prev) => [...prev, lastRemoved.id]);
      setLayouts((prev) => ({ ...prev, lg: [...prev.lg, lastRemoved.layout] }));
      setLastRemoved(null);
    }
  };

  const handleDragStart = (_layout: Layout[], _oldItem: Layout, newItem: Layout) => {
    setDraggingId(newItem.i);
  };

  const handleDragStop = (
    _layout: Layout[],
    _oldItem: Layout,
    _newItem: Layout,
    _placeholder: Layout,
    _e: MouseEvent,
    element: HTMLElement
  ) => {
    const trash = trashRef.current;
    if (trash) {
      const trashRect = trash.getBoundingClientRect();
      const boxRect = element.getBoundingClientRect();

      // Verifica colisão entre o box arrastado e a lixeira
      const intersecting =
        boxRect.right > trashRect.left &&
        boxRect.left < trashRect.right &&
        boxRect.bottom > trashRect.top &&
        boxRect.top < trashRect.bottom;

      if (intersecting && draggingId) {
        removeBox(draggingId);
      }
    }
    setDraggingId(null);
  };






  return (
    <div className="relative min-h-screen w-full">
      {/* --- Header do Dashboard --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 p-4 rounded-xl shadow mb-6 gap-4">
        <span className="font-bold text-lg">{getFormattedCurrentDate()}</span>

        <div className="flex items-center gap-4">
          <span className="bg-white px-6 py-2 rounded-full font-semibold">
            Olá, humano!
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className={`p-2 rounded-full transition ${editMode ? "bg-indigo-100 text-indigo-600" : "bg-white hover:bg-gray-200"}`}
              title={editMode ? "Bloquear layout" : "Editar layout"}
            >
              {editMode ? <Unlock size={18} /> : <Lock size={18} />}
            </button>

            <button
              onClick={() => {
                if (window.confirm("Resetar layout para o padrão?")) {
                  resetDashboard();
                }
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-200 transition"
              title="Resetar layout padrão"
            >
              <Undo2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Grid Responsivo --- */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 480 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        rowHeight={100}
        isDraggable={editMode}
        isResizable={editMode}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onLayoutChange={(_layout, allLayouts) => setLayouts(allLayouts)}
        draggableCancel=".no-drag"
      >
        {boxes.map((boxId) => {
          // Só renderiza se o box existir no componentMap
          if (!componentMap[boxId]) return null;

          return (
            <div
              key={boxId}
              className={`h-full w-full ${
                editMode ? "border-2 border-dashed border-primary/50 rounded-xl bg-white/50" : ""
              }`}
            >
              {componentMap[boxId]}
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* --- Lixeira com Ref --- */}
      <div
        id="trash-area"
        ref={trashRef}
        onClick={handleTrashClick}
        className={`fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 rounded-full cursor-pointer shadow-lg transition-all duration-300 z-50 ${
          draggingId
            ? "bg-red-500 scale-110 shadow-red-200"
            : "bg-white hover:bg-gray-50 text-gray-400"
        }`}
        title={lastRemoved ? "Desfazer remoção" : "Arraste aqui para remover"}
      >
        {lastRemoved ? (
          <Undo2 className="w-6 h-6 text-indigo-600" />
        ) : (
          <Trash className={`w-6 h-6 ${draggingId ? "text-white" : ""}`} />
        )}
      </div>
    </div>
  );
}