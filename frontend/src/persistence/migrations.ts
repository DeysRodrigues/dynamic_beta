import type { BoxRef } from "@/types/Box";
import { boxFromLegacyId } from "@/utils/BoxFactory";

function toBoxRef(value: unknown): BoxRef | null {
  if (typeof value === "string") return boxFromLegacyId(value);
  if (value && typeof value === "object") {
    const { id, type } = value as Partial<BoxRef>;
    if (typeof id === "string" && typeof type === "string") return { id, type };
  }
  return null;
}

function toBoxRefs(value: unknown): BoxRef[] {
  if (!Array.isArray(value)) return [];
  return value.map(toBoxRef).filter((box): box is BoxRef => box !== null);
}

/**
 * dashboard-storage, v1 -> v2.
 *
 * - `boxes` goes from `string[]` to `{ id, type }[]`.
 * - The top-level `layouts` and `boxes` mirrors are dropped: the active workspace is the only
 *   source now.
 * - Data from before workspaces existed (only the mirrors, no `workspaces`) becomes a single
 *   workspace.
 *
 * Returns `{}` when there is nothing usable, so the store keeps its defaults.
 */
export function migrateDashboard(persisted: unknown): Record<string, unknown> {
  const old = (persisted ?? {}) as {
    workspaces?: Array<{ id: string; name: string; layouts: unknown; boxes?: unknown }>;
    activeWorkspaceId?: string;
    layouts?: unknown;
    boxes?: unknown;
  };

  let workspaces = Array.isArray(old.workspaces) ? old.workspaces : [];
  if (workspaces.length === 0 && old.layouts) {
    workspaces = [{ id: "default", name: "Principal", layouts: old.layouts, boxes: old.boxes }];
  }
  if (workspaces.length === 0) return {};

  const migrated = workspaces.map((ws) => ({ ...ws, boxes: toBoxRefs(ws.boxes) }));
  const active = migrated.some((ws) => ws.id === old.activeWorkspaceId)
    ? old.activeWorkspaceId
    : migrated[0].id;

  return { workspaces: migrated, activeWorkspaceId: active };
}

/** projects-storage, v1 -> v2: each project's `boxes` goes from `string[]` to `{ id, type }[]`. */
export function migrateProjects(persisted: unknown): unknown {
  const old = (persisted ?? {}) as { projects?: Array<{ boxes?: unknown }> };
  if (!Array.isArray(old.projects)) return persisted;
  return {
    ...old,
    projects: old.projects.map((project) => ({ ...project, boxes: toBoxRefs(project.boxes) })),
  };
}
