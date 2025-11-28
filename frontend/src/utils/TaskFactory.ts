import type { Task } from "@/types/Task";
import { getTodayDate } from "@/utils/DateUtils";

export function createTask(
  description: string,
  time: string | undefined,
  tag: string,
  duration: number,
  groupTag?: string // Novo parâmetro opcional
): Task {
  return {
    id: Date.now().toString() + Math.random().toString(36),
    description,
    time: time || undefined,
    tag,
    groupTag, // Salva a Tagzona
    completed: false,
    date: getTodayDate(),
    duration,
  };
}