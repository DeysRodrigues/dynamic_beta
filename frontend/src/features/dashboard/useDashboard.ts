import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Layouts } from "react-grid-layout";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { BoxRef } from "@/types/Box";

/** What the grid needs to draw: the active workspace, or the active project when one is open. */
export interface ActiveBoard {
  id: string;
  name: string;
  layouts: Layouts;
  boxes: BoxRef[];
}

/**
 * Everything the dashboard page needs from the stores. A project, when active, takes the place
 * of the workspace, and adding, removing and re-laying boxes goes to the project instead.
 */
export function useDashboard() {
  const { workspaces, activeWorkspaceId, setLayouts, addWorkspaceBox, removeWorkspaceBox } =
    useDashboardStore(
      useShallow((state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        setLayouts: state.setLayouts,
        addWorkspaceBox: state.addBox,
        removeWorkspaceBox: state.removeBox,
      }))
    );

  const { projects, activeProjectId, updateProjectLayout, addBoxToProject, removeBoxFromProject } =
    useProjectStore(
      useShallow((state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        updateProjectLayout: state.updateProjectLayout,
        addBoxToProject: state.addBoxToProject,
        removeBoxFromProject: state.removeBoxFromProject,
      }))
    );

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const board: ActiveBoard | undefined = activeProject ?? workspaces.find((w) => w.id === activeWorkspaceId);

  const addBox = useCallback(
    (type: string) => {
      if (activeProjectId) addBoxToProject(activeProjectId, type);
      else addWorkspaceBox(type);
    },
    [activeProjectId, addBoxToProject, addWorkspaceBox]
  );

  const removeBox = useCallback(
    (boxId: string) => {
      if (activeProjectId) removeBoxFromProject(activeProjectId, boxId);
      else removeWorkspaceBox(boxId);
    },
    [activeProjectId, removeBoxFromProject, removeWorkspaceBox]
  );

  const changeLayouts = useCallback(
    (_layout: unknown, allLayouts: Layouts) => {
      if (activeProjectId) updateProjectLayout(activeProjectId, allLayouts);
      else setLayouts(allLayouts);
    },
    [activeProjectId, updateProjectLayout, setLayouts]
  );

  return { board, activeProjectId, addBox, removeBox, changeLayouts };
}
