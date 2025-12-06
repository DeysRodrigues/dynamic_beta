import { useState } from "react";
import { createTask } from "@/utils/TaskFactory";
import { useTagStore } from "@/store/useTagStore";
import type { Task } from "@/types/Task";

interface BulkTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: Task[]) => void;
  targetDate?: string;
  targetGroupTag?: string;
}

export function BulkTaskModal({ isOpen, onClose, onAddTasks, targetDate, targetGroupTag }: BulkTaskModalProps) {
  const { tags } = useTagStore();
  const [bulkTaskInput, setBulkTaskInput] = useState("");
  const [defaultTag, setDefaultTag] = useState("");
  const [startTime, setStartTime] = useState(""); 

  if (!isOpen) return null;

  const handleProcess = () => {
    // ... (Logica mantida igual)
    if (!bulkTaskInput.trim()) return alert("Digite pelo menos uma tarefa.");
    const lines = bulkTaskInput.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("-") || line.startsWith("*") || line.startsWith("+"));
    if (lines.length === 0) return alert("Use '- ' para tarefas ou '+' para pausas.");

    let currentCalcTime = startTime || null;
    const tasksToAdd: Task[] = [];

    for (const line of lines) {
      let tempLine = line;
      let duration = 15;
      let selectedTag = defaultTag;
      let selectedGroupTag = targetGroupTag || undefined; 
      let specificTime = null;
      const isPlusMode = tempLine.startsWith("+");

      if (isPlusMode) {
        const plusMatch = tempLine.match(/^(\++)/);
        const plusCount = plusMatch ? plusMatch[1].length : 0;
        duration = plusCount * 60;
        tempLine = tempLine.replace(/^(\++)/, ""); 
      } else { tempLine = tempLine.replace(/^([-*])/, ""); }

      const timeMatch = tempLine.match(/>>\s*(\d{1,2}:\d{2})/);
      if (timeMatch) { specificTime = timeMatch[1].padStart(5, "0"); tempLine = tempLine.replace(timeMatch[0], ""); currentCalcTime = specificTime; }

      const durationMatch = tempLine.match(/>\s*(\d+)(h|min|m)?/i);
      if (durationMatch) {
        const val = parseInt(durationMatch[1]);
        const unit = durationMatch[2]?.toLowerCase();
        if (unit === 'h') duration = val * 60; else duration = val;
        tempLine = tempLine.replace(durationMatch[0], "");
      }

      const tagMatch = tempLine.match(/\[(.*?)\]/);
      if (tagMatch) { const rawTag = tagMatch[1].trim(); selectedTag = tags.find(t => t.toLowerCase() === rawTag.toLowerCase()) || rawTag; tempLine = tempLine.replace(tagMatch[0], ""); }

      const groupMatch = tempLine.match(/\{(.*?)\}/);
      if (groupMatch) { selectedGroupTag = groupMatch[1].trim(); tempLine = tempLine.replace(groupMatch[0], ""); }

      const description = tempLine.trim();
      if (!description) continue;

      const finalTime = specificTime || currentCalcTime || undefined;
      const task = createTask(description, finalTime, selectedTag, duration, selectedGroupTag);
      if (targetDate) task.date = targetDate;
      tasksToAdd.push(task);

      if (finalTime) {
        const [hours, minutes] = finalTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        currentCalcTime = `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
      }
    }
    onAddTasks(tasksToAdd); setBulkTaskInput(""); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200 border border-white/10"
        style={{ backgroundColor: 'var(--box-color)', color: 'var(--box-text-color)' }}
      >
        <h3 className="text-xl font-bold">
          Adicionar Tarefas {targetGroupTag ? `(Grupo: ${targetGroupTag})` : ""}
        </h3>
        
        <div className="text-sm p-3 rounded-lg border border-current/10 bg-black/5 opacity-80">
          <p className="font-semibold mb-1">Sintaxe Power User:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-4 text-xs">
            <li><code>- Texto</code> : Tarefa</li>
            <li><code>&gt;30min</code> : Duração</li>
            <li><code>&gt;&gt;14:00</code> : Horário Início</li>
            <li><code>[Tag]</code> : Tag Específica</li>
            <li><code>{`{Grupo}`}</code> : Tagzona</li>
          </ul>
        </div>

        <textarea
          value={bulkTaskInput}
          onChange={(e) => setBulkTaskInput(e.target.value)}
          placeholder="- Limpar quarto >2h >>15:00 [Casa]"
          className="w-full h-40 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-black/5 border-current/20 text-inherit placeholder:opacity-40"
        />

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <span className="text-xs opacity-60 ml-1">Tag Padrão</span>
            <select
              value={defaultTag}
              onChange={(e) => setDefaultTag(e.target.value)}
              className="px-3 py-2 border rounded-lg outline-none text-sm w-32 bg-black/5 border-current/20 text-inherit"
            >
              <option value="">(Nenhuma)</option>
              {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs opacity-60 ml-1">Início Sequência</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-3 py-2 border rounded-lg outline-none text-sm bg-black/5 border-current/20 text-inherit"
            />
          </div>

          <div className="flex-1 flex justify-end gap-2 mt-4 sm:mt-0">
            <button onClick={onClose} className="px-4 py-2 hover:bg-black/10 rounded-lg transition">Cancelar</button>
            <button onClick={handleProcess} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  );
}