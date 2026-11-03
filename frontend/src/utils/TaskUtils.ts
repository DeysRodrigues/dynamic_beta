import type { Task } from "@/types/Task";

// Converts "1:30" or "90" to minutes (number)
export function parseDuration(duration?: string | number): number {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;

  const parts = duration.split(":");
  if (parts.length === 2) {
    const hours = Number(parts[0]) || 0;
    const minutes = Number(parts[1]) || 0;
    return hours * 60 + minutes;
  }

  const asNumber = Number(duration);
  return isNaN(asNumber) ? 0 : asNumber;
}

// Groups a task array by date (the object key)
export function groupTasksByDate(tasks: Task[]) {
  return tasks.reduce((grouped, task) => {
    if (!grouped[task.date]) grouped[task.date] = [];
    grouped[task.date].push(task);
    return grouped;
  }, {} as Record<string, Task[]>);
}