import { useCallback, useState } from "react";
import LayoutManagerModal from "@/components/layout/modals/LayoutManagerModal";
import { BoxLoader } from "./BoxLoader";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardHeader } from "./DashboardHeader";
import { useDashboard } from "./useDashboard";

export default function DashboardPage() {
  const { board, activeProjectId, addBox, removeBox, changeLayouts } = useDashboard();
  const [editMode, setEditMode] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  const openLayoutManager = useCallback(() => setShowLayoutManager(true), []);
  const toggleEditMode = useCallback(() => setEditMode((p) => !p), []);

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BoxLoader />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full pb-20" style={{ color: "var(--box-text-color)" }}>
      <LayoutManagerModal isOpen={showLayoutManager} onClose={() => setShowLayoutManager(false)} />

      <DashboardHeader
        onSave={openLayoutManager}
        editMode={editMode}
        toggleEditMode={toggleEditMode}
        onAddWidget={addBox}
      />

      <DashboardGrid
        boardKey={board.id}
        layouts={board.layouts}
        boxes={board.boxes || []}
        projectId={activeProjectId}
        editMode={editMode}
        onLayoutChange={changeLayouts}
        onRemoveBox={removeBox}
      />
    </div>
  );
}
