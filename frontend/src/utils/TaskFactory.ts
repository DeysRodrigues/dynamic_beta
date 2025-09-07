import type { Task } from "@/types/Task";
import { getTodayDate } from "@/utils/DateUtils";


/**
 * Cria uma nova tarefa padronizada com ID, data e estado de completude.
 * 
 * @param description - Texto da tarefa
 * @param time - Horário da tarefa no formato "HH:mm"
 * @param tag - Tag associada à tarefa
 * @param duration - Duração da tarefa em minutos
 * @returns Objeto `Task` formatado
 */

export function createTask(
  description: string,
  time: string,
  tag: string,
  duration: number
): Task {
  return {
    id: Date.now().toString() + Math.random().toString(36), // Garante um ID único
    description,
    time,
    tag,
    completed: false,
    date: getTodayDate(), // Data correta no formato local "YYYY-MM-DD"
    duration,
  };
}
