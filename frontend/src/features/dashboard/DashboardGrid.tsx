import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Responsive, WidthProvider, type Layouts } from "react-grid-layout";
import type { BoxRef } from "@/types/Box";
import { widgetRegistry } from "@/widgets/registry";
import { BoxFrame } from "./BoxFrame";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  /** Changes when the board changes, so the grid remounts with the new layouts. */
  boardKey: string;
  layouts: Layouts;
  boxes: BoxRef[];
  projectId: string | null;
  editMode: boolean;
  onLayoutChange: (layout: unknown, allLayouts: Layouts) => void;
  onRemoveBox: (boxId: string) => void;
}

export function DashboardGrid({
  boardKey,
  layouts,
  boxes,
  projectId,
  editMode,
  onLayoutChange,
  onRemoveBox,
}: DashboardGridProps) {
  return (
    <ResponsiveGridLayout
      key={boardKey}
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1024, md: 768, sm: 480, xs: 0 }}
      cols={{ lg: 4, md: 2, sm: 1, xs: 1 }}
      rowHeight={100}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".drag-handle"
      onLayoutChange={onLayoutChange}
      draggableCancel=".no-drag"
      margin={[12, 12]}
      containerPadding={[0, 0]}
    >
      {/* A box whose type has no widget (an old preset, say) is skipped, as it always was. */}
      {boxes.filter((box) => widgetRegistry[box.type]).map((box) => (
        <div key={box.id}>
          <BoxFrame box={box} projectId={projectId} editMode={editMode} onRemove={onRemoveBox} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
