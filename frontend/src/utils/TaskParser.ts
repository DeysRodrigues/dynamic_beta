import type { Task } from "@/types/Task";

/**
 * Converte Task -> Texto
 */
export function formatTaskToText(task: Task): string {
  const statusPrefix = task.completed ? "- [x]" : "-";
  const parts = [`${statusPrefix} ${task.description}`];

  if (task.duration) {
    if (task.duration % 60 === 0) {
      parts.push(`>${task.duration / 60}h`);
    } else {
      parts.push(`>${task.duration}min`);
    }
  }

  if (task.time) {
    parts.push(`>>${task.time}`);
  }

  if (task.tag) {
    parts.push(`[${task.tag}]`);
  }

  if (task.groupTag) {
    parts.push(`{${task.groupTag}}`);
  }

  return parts.join(" ");
}

/**
 * Converte Texto -> Dados da Task
 */
export function parseTextToTaskData(text: string) {
  let tempLine = text.trim();
  let duration = 15;
  let tag = "";
  let groupTag = "";
  let time = undefined;
  let completed = false;

  // Verificar Status
  if (/^x\s+-|^-?\s*\[x\]/i.test(tempLine)) {
    completed = true;
    tempLine = tempLine.replace(/^x\s+-|^-?\s*\[x\]/i, "").trim();
  } else if (/^-\s*\[\s*\]/.test(tempLine)) {
    completed = false;
    tempLine = tempLine.replace(/^-\s*\[\s*\]/, "").trim();
  }

  const isPlusMode = tempLine.startsWith("+");

  // 1. Prefixo
  if (isPlusMode) {
    const plusMatch = tempLine.match(/^(\++)/);
    const plusCount = plusMatch ? plusMatch[1].length : 0;
    duration = plusCount * 60;
    tempLine = tempLine.replace(/^(\++)/, "");
  } else {
    tempLine = tempLine.replace(/^([-*])/, "");
  }

  // 2. Horário (>> HH:mm)
  const timeMatch = tempLine.match(/>>\s*(\d{1,2}:\d{2})/);
  if (timeMatch) {
    time = timeMatch[1].padStart(5, "0");
    tempLine = tempLine.replace(timeMatch[0], "");
  }

  // 3. Duração (> 30min)
  // CORREÇÃO AQUI: Mudamos (h|m|min) para (h|min|m) para o 'min' ter prioridade sobre 'm'
  const durationMatch = tempLine.match(/>\s*(\d+)(h|min|m)?/i);
  if (durationMatch) {
    const val = parseInt(durationMatch[1]);
    const unit = durationMatch[2]?.toLowerCase();
    
    if (unit === 'h') duration = val * 60;
    else duration = val;
    
    tempLine = tempLine.replace(durationMatch[0], "");
  }

  // 4. Tag ([Tag])
  const tagMatch = tempLine.match(/\[(.*?)\]/);
  if (tagMatch) {
    tag = tagMatch[1].trim();
    tempLine = tempLine.replace(tagMatch[0], "");
  }

  // 5. Grupo ({Grupo})
  const groupMatch = tempLine.match(/\{(.*?)\}/);
  if (groupMatch) {
    groupTag = groupMatch[1].trim();
    tempLine = tempLine.replace(groupMatch[0], "");
  }

  const description = tempLine.trim();

  return { description, time, duration, tag, groupTag, completed };
}