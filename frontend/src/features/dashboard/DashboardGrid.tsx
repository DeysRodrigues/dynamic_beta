import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Responsive, type Layouts } from "react-grid-layout";
import type { BoxRef } from "@/types/Box";
import { useMemo } from "react";
import { getDefaultHeight, widgetRegistry } from "@/widgets/registry";
import { ensureLayouts } from "@/utils/layout";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { BoxFrame } from "./BoxFrame";

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
  // A box with no layout entry would be drawn at the minimum size, so fill the gaps. This also
  // repairs projects saved before they got proper layouts; the grid reports the result back.
  // A box whose type has no widget (an old preset, say) is skipped, as it always was.
  const renderable = useMemo(() => boxes.filter((box) => widgetRegistry[box.type]), [boxes]);
  const fullLayouts = useMemo(() => ensureLayouts(renderable, layouts, getDefaultHeight), [renderable, layouts]);

  // The grid picks its breakpoint from its width. Drawing it once at a guessed width and again at
  // the real one swaps the whole layout (4 columns to 2, say) in front of the user on a reload,
  // so it is drawn only after the width is known. `measureBeforeMount` is not an option here: in
  // this version it never renders the children at all if its resize observer does not fire.
  const { ref, width } = useContainerWidth<HTMLDivElement>();

  return (
    <div ref={ref}>
      {width !== null && (
        <Responsive
          key={boardKey}
          width={width}
          className="layout"
          layouts={fullLayouts}
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
          {renderable.map((box) => (
            <div key={box.id}>
              <BoxFrame box={box} projectId={projectId} editMode={editMode} onRemove={onRemoveBox} />
            </div>
          ))}
        </Responsive>
      )}
    </div>
  );
}
