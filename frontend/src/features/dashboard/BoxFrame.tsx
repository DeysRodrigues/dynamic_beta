import { Suspense } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import type { BoxRef } from "@/types/Box";
import { widgetRegistry } from "@/widgets/registry";
import { cn } from "@/lib/utils";
import { useHydration } from "@/persistence/hydration";
import { BoxLoader } from "./BoxLoader";

interface BoxFrameProps {
  box: BoxRef;
  projectId: string | null;
  editMode: boolean;
  onRemove: (boxId: string) => void;
}

/** One cell of the grid: the widget itself plus, in edit mode, its drag handle and delete button. */
export function BoxFrame({ box, projectId, editMode, onRemove }: BoxFrameProps) {
  // Changes when saved content was replaced from outside (the server), so the widget reloads it.
  const epoch = useHydration((state) => state.epoch);
  const widget = widgetRegistry[box.type];
  if (!widget) return null;
  const Widget = widget.component;

  return (
    <div
      className={cn(
        "h-full w-full transition-all duration-300 relative group rounded-2xl overflow-hidden",
        editMode && "ring-2 ring-amber-500/50 shadow-xl z-10 bg-current/5"
      )}
    >
      {editMode && (
        <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between p-2 bg-amber-500/20 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-amber-500/30 rounded-lg transition-colors">
            <GripVertical size={18} className="text-amber-600" />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter hidden sm:inline px-2">
              {box.type}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Remover este widget deste workspace?")) onRemove(box.id);
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
        <Suspense fallback={<BoxLoader />}>
          <Widget key={epoch} id={box.id} projectId={projectId} />
        </Suspense>
      </div>
    </div>
  );
}
