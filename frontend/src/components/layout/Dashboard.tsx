import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Search, ZoomIn, Trash, Undo2 } from "lucide-react";
import { useState } from "react";
import ProgressBox from "./boxes/ProgressBox";
import TagsBox from "./boxes/TagsBox";
import HoursBox from "./boxes/HoursBox";
import PomodoroBox from "./boxes/PomodoroBox";
import TasksImportBox from "./boxes/TasksImportBox";
import EmbeddedBox from "./boxes/EmbeddedBox";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const [boxes, setBoxes] = useState<string[]>([
    "progress",
    "tags",
    "hours",
    "pomodoro",
    "tasksimport",
    "embedded",
  ]);

  const [layouts, setLayouts] = useState<Layouts>({
    lg: [
      { i: "progress", x: 2, y: 0, w: 2, h: 2 },
      { i: "tags", x: 2, y: 0, w: 2, h: 2 },
      { i: "hours", x: 0, y: 2, w: 2, h: 2.4 },
      { i: "pomodoro", x: 2, y: 2, w: 2, h: 3 },
      { i: "tasksimport", x: 0, y: 3, w: 2, h: 3 },
      { i: "embedded", x: 0, y: 0, w: 2, h: 4 },
    ],
    md: [
      { i: "progress", x: 0, y: 0, w: 1, h: 2 },
      { i: "tags", x: 1, y: 0, w: 1, h: 2 },
      { i: "hours", x: 0, y: 2, w: 1, h: 2 },
      { i: "pomodoro", x: 1, y: 2, w: 1, h: 2 },
      { i: "tasksimport", x: 0, y: 4, w: 4, h: 3 },
      { i: "embedded", x: 0, y: 7, w: 4, h: 3 },
    ],
    sm: [
      { i: "progress", x: 0, y: 0, w: 1, h: 2 },
      { i: "tags", x: 0, y: 2, w: 1, h: 2 },
      { i: "hours", x: 0, y: 4, w: 1, h: 2 },
      { i: "pomodoro", x: 0, y: 6, w: 1, h: 3 },
      { i: "tasksimport", x: 0, y: 4, w: 4, h: 3 },
      { i: "embedded", x: 0, y: 7, w: 4, h: 3 },
    ],
  });

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
    newItem: Layout,
    _placeholder: Layout,
    _e: MouseEvent,
    _element: HTMLElement
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

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="p-6 relative min-h-screen">
      {/* Barra Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 p-4 rounded-xl shadow mb-6 gap-4">
        <span className="font-bold text-lg">Seg, {currentDate}</span>
        <div className="flex items-center gap-4">
          <span className="bg-white px-6 py-2 rounded-full font-semibold">
            Olá, deys!
          </span>
          <button className="p-2 bg-white rounded-full hover:bg-gray-200">
            <Search size={18} />
          </button>
          <button className="p-2 bg-white rounded-full hover:bg-gray-200">
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Grid Responsivo */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 480 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        rowHeight={100}
        isDraggable
        isResizable={window.innerWidth >= 1024}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
      >
        {boxes.includes("progress") && (
          <div key="progress" className="h-full w-full">
            <ProgressBox />
          </div>
        )}
        {boxes.includes("tags") && (
          <div key="tags" className="h-full w-full">
            <TagsBox />
          </div>
        )}
        {boxes.includes("hours") && (
          <div key="hours" className="h-full w-full">
            <HoursBox />
          </div>
        )}
        {boxes.includes("pomodoro") && (
          <div key="pomodoro" className="h-full w-full">
            <PomodoroBox />
          </div>
        )}
        {boxes.includes("tasksimport") && (
          <div key="tasksimport" className="h-full w-full">
            <TasksImportBox />
          </div>
        )}
        {boxes.includes("embedded") && (
          <div key="embedded" className="h-full w-full">
            <EmbeddedBox />
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
