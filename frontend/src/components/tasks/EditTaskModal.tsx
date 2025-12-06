import { useState, useEffect } from "react";
import { Copy, Save, X } from "lucide-react";
import type { Task } from "@/types/Task";
import { formatTaskToText, parseTextToTaskData } from "@/utils/TaskParser";
import { useTaskStore } from "@/store/useTaskStore";

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const { updateTask } = useTaskStore();
  const [text, setText] = useState("");

  useEffect(() => {
    if (task && isOpen) {
      setText(formatTaskToText(task));
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (!text.trim()) return alert("O texto não pode estar vazio.");
    const parsedData = parseTextToTaskData(text);
    if (!parsedData.description) return alert("A tarefa precisa de uma descrição.");

    updateTask(task.id, {
      description: parsedData.description,
      time: parsedData.time,
      duration: parsedData.duration,
      tag: parsedData.tag || task.tag,
      groupTag: parsedData.groupTag || task.groupTag,
    });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Script copiado!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-white/10"
        // CORREÇÃO: Usa as variáveis do tema para o fundo
        style={{ backgroundColor: 'var(--box-color)', color: 'var(--box-text-color)' }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Editar Tarefa (Script)</h3>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        <div className="text-sm p-3 rounded border border-current/10 bg-black/5 opacity-80">
          Edite os atributos usando a sintaxe:<br/>
          <code>- Texto &gt;Duração &gt;&gt;Horário [Tag] {`{Grupo}`}</code>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          // CORREÇÃO: Fundo transparente para o textarea
          className="w-full h-32 p-4 border rounded-xl font-mono text-sm outline-none resize-none bg-black/5 border-current/20 text-inherit focus:ring-2 focus:ring-primary/20"
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={handleCopy}
            className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg flex items-center gap-2 transition"
          >
            <Copy size={18} /> Copiar
          </button>
          
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 transition shadow-sm"
          >
            <Save size={18} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}