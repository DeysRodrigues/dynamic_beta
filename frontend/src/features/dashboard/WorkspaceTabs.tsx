import React, { useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Briefcase, Layout, Plus, X } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProjectStore } from "@/store/useProjectStore";
import { cn } from "@/lib/utils";

// --- WORKSPACE TABS ---
export const WorkspaceTabs = React.memo(() => {
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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-2 mask-gradient-right">
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
          <div key={w.id} className="group relative flex flex-col items-center">
            <div
              onClick={() => handleSelectWorkspace(w.id)}
              onDoubleClick={() => startRename(w.id, w.name)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 select-none whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-current/10 text-primary opacity-100"
                  : "opacity-40 hover:opacity-100 hover:bg-current/5"
              )}
            >
              <Layout size={14} className={cn("transition-transform", isActive ? "scale-110" : "opacity-50")} />
              {w.name}
              
              {workspaces.length > 1 && isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Excluir este workspace?")) removeWorkspace(w.id);
                  }}
                  className="ml-1 p-0.5 hover:bg-red-500 hover:text-white rounded-md transition-colors opacity-60 hover:opacity-100"
                  title="Excluir Workspace"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              )}
            </div>
            
            {/* Indicador de Workspace Ativo */}
            <div className={cn(
              "h-1 w-1/3 rounded-full bg-primary mt-1 transition-all duration-500",
              isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )} />
          </div>
        );
      })}

      {/* Separador sutil se houver projetos */}
      {projects.some(p => p.status === 'active') && (
        <div className="w-px h-6 bg-current/10 mx-1" />
      )}

      {/* Projetos Ativos */}
      {projects.filter(p => p.status === 'active').map((p) => {
        const isActive = activeProjectId === p.id;
        return (
          <div key={p.id} className="group relative">
            <button
              onClick={() => handleSelectProject(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-black transition-all duration-300 flex items-center gap-2 select-none whitespace-nowrap border uppercase tracking-tighter",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-transparent border-current/20 opacity-40 hover:opacity-100 hover:border-current/40"
              )}
            >
              <Briefcase size={12} strokeWidth={3} />
              <span className="flex items-center gap-1">
                <span className="opacity-60 font-medium lowercase italic">projeto:</span>
                {p.name}
              </span>
            </button>
          </div>
        );
      })}

      <button
        onClick={handleAdd}
        className="ml-2 p-2 rounded-xl opacity-30 hover:opacity-100 hover:bg-current/10 transition-all"
        title="Nova Aba"
      >
        <Plus size={16} />
      </button>
    </div>
  );
});
