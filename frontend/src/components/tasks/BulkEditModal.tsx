import { useState, useEffect } from "react";
import { Save, X, Copy } from "lucide-react";
import type { Task } from "@/types/Task";
import { formatTaskToText, parseTextToTaskData } from "@/utils/TaskParser";
import { createTask } from "@/utils/TaskFactory";
import { useTaskStore } from "@/store/useTaskStore";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasksToEdit: Task[];
}

export function BulkEditModal({ isOpen, onClose, tasksToEdit }: BulkEditModalProps) {
  const { removeTasks, addTask } = useTaskStore(); 
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen && tasksToEdit.length > 0) {
      const tasksText = tasksToEdit.map(formatTaskToText).join("\n");
      setText(tasksText);
    }
  }, [isOpen, tasksToEdit]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!window.confirm("Isso irá substituir as tarefas editadas. Continuar?")) return;
    const idsToRemove = tasksToEdit.map(t => t.id);
    removeTasks(idsToRemove);

    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const baseDate = tasksToEdit[0]?.date; 

    lines.forEach(line => {
      const data = parseTextToTaskData(line);
      if (data.description) {
        const newTask = createTask(data.description, data.time, data.tag, data.duration, data.groupTag);
        if (baseDate) newTask.date = baseDate;
        newTask.completed = data.completed;
        addTask(newTask);
      }
    });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Lista copiada!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200 border border-white/10"
        style={{ backgroundColor: 'var(--box-color)', color: 'var(--box-text-color)' }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Editor em Massa ({tasksToEdit.length} tarefas)</h3>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 hover:text-red-500 transition"><X size={24} /></button>
        </div>

        <div className="text-sm p-3 rounded border border-current/10 bg-black/5 opacity-80">
          <p>Edite livremente. Use <code>- [x]</code> para tarefas concluídas.</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-4 border rounded-xl font-mono text-sm outline-none resize-none leading-relaxed bg-black/5 border-current/20 text-inherit focus:ring-2 focus:ring-primary/20"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={handleCopy} className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg flex items-center gap-2 transition">
            <Copy size={16} /> Copiar
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 shadow-sm">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}