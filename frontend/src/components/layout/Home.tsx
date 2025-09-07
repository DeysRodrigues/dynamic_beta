import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Trash, Undo2, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import ProgressBox from "./boxes/ProgressBox";
import MetaTagsBox from "./boxes/MetaTagsBox";
import HoursBox from "./boxes/HoursBox";
import PomodoroBox from "./boxes/PomodoroBox";
import EmbeddedBox from "./boxes/EmbeddedBox";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { useDashboard } from "@/context/DashboardContext";
import TagsBox from "./boxes/TagsBox";
import BoxTask from "./boxes/BoxTask";
import {getFormattedCurrentDate} from "@/utils/DateUtils"

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const {
    layouts,
    setLayouts,
    boxes,
    setBoxes,
    saveDashboard,
    resetDashboard,
  } = useDashboard();

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!editMode) {
      saveDashboard();
    }
  }, [editMode, saveDashboard]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{
    id: string;
    layout: Layout;
  } | null>(null);

  const removeBox = (id: string) => {
    const layoutItem = layouts.lg.find((item: Layout) => item.i === id);
    if (layoutItem) {
      setLastRemoved({ id, layout: layoutItem });
    }
    setBoxes((prev) => prev.filter((box) => box !== id));
    setLayouts((prev) => ({
      ...prev,
      lg: prev.lg.filter((item: Layout) => item.i !== id),
    }));
  };

  const handleTrashClick = () => {
    if (lastRemoved && !boxes.includes(lastRemoved.id)) {
      setBoxes((prev) => [...prev, lastRemoved.id]);
      setLayouts((prev) => ({
        ...prev,
        lg: [...prev.lg, lastRemoved.layout],
      }));
      setLastRemoved(null);
    }
  };

  const handleDragStart = (
    _layout: Layout[],
    _oldItem: Layout,
    newItem: Layout
    /*     _placeholder: Layout,
    _e: MouseEvent,
    _element: HTMLElement */
  ) => {
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
    const trash = document.getElementById("trash-area");
    if (trash) {
      const trashRect = trash.getBoundingClientRect();
      const boxRect = element.getBoundingClientRect();

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

  const currentDate = getFormattedCurrentDate();

  return (
    <div className="relative min-h-screen w-full">
      {/* Barra Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 p-4 rounded-xl shadow mb-6 gap-4">
        <span className="font-bold text-lg">{currentDate}</span>

        <div className="flex items-center gap-4">
          <span className="bg-white px-6 py-2 rounded-full font-semibold">
            Olá, deys!
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="p-2 bg-white rounded-full hover:bg-gray-200"
            >
              {editMode ? <Unlock size={18} /> : <Lock size={18} />}
            </button>

            <button
              onClick={() => {
                resetDashboard();
                alert("Layout resetado ao padrão!");
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-200"
              title="Resetar layout padrão"
            >
              <Undo2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Responsivo */}
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
        onLayoutChange={(_layout, allLayouts) => {
          setLayouts(allLayouts); // atualiza TODOS os layouts por breakpoint
        }}
        draggableCancel=".no-drag" // <-- adicionado
      >
        {boxes.includes("progress") && (
          <div
            key="progress"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <ProgressBox />
          </div>
        )}
        {boxes.includes("metatags") && (
          <div
            key="metatags"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <MetaTagsBox />
          </div>
        )}
        {boxes.includes("hours") && (
          <div
            key="hours"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <HoursBox />
          </div>
        )}
        {boxes.includes("pomodoro") && (
          <div
            key="pomodoro"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <PomodoroBox />
          </div>
        )}

        {boxes.includes("embedded") && (
          <div
            key="embedded"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <EmbeddedBox />
          </div>
        )}

        {boxes.includes("tags") && (
          <div
            key="tags"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <TagsBox />
          </div>
        )}
   
        {boxes.includes("tasks") && (
          <div
            key="tasks"
            className={`h-full w-full ${
              editMode ? "border-2 border-dashed border-primary" : ""
            }`}
          >
            <BoxTask />
          </div>
        )}
      </ResponsiveGridLayout>

      {/* Área da Lixeira */}
      <div
        id="trash-area"
        onClick={handleTrashClick}
        className={`fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 rounded-full cursor-pointer ${
          draggingId ? "bg-red-500 scale-110" : "bg-gray-200"
        } shadow transition-transform`}
      >
        {lastRemoved ? (
          <Undo2 className="w-6 h-6 text-gray-600" />
        ) : (
          <Trash
            className={`w-6 h-6 ${draggingId ? "text-white" : "text-gray-600"}`}
          />
        )}
      </div>
    </div>
  );
}
