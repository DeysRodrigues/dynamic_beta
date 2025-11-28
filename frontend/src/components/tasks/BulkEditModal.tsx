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
  // Substituímos deleteTask por removeTasks
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

    // CORREÇÃO: Remove todas as tarefas antigas de uma vez sem alerts individuais
    const idsToRemove = tasksToEdit.map(t => t.id);
    removeTasks(idsToRemove);

    // Processa o texto e cria novas tarefas
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const baseDate = tasksToEdit[0]?.date; 

    lines.forEach(line => {
      const data = parseTextToTaskData(line);
      if (data.description) {
        const newTask = createTask(
          data.description,
          data.time,
          data.tag,
          data.duration,
          data.groupTag
        );
        
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Editor em Massa ({tasksToEdit.length} tarefas)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
        </div>

        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
          <p>Edite livremente. Use <code>- [x]</code> para tarefas concluídas.</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none leading-relaxed"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={handleCopy} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-gray-600">
            <Copy size={16} /> Copiar
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}