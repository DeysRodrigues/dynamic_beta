import type { Task } from "@/types/Task";
import { getTodayDate } from "@/utils/DateUtils";

export function createTask(
  description: string,
  time: string | undefined,
  tag: string,
  duration: number,
  groupTag?: string,
  workspaceId?: string
): Task {
  return {
    id: Date.now().toString() + Math.random().toString(36),
    description,
    time: time || undefined,
    tag,
    groupTag, 
    workspaceId,
    completed: false,
    date: getTodayDate(),
    duration,
  };
}