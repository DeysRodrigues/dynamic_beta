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

  // Quando abre, converte a task atual para texto
  useEffect(() => {
    if (task && isOpen) {
      setText(formatTaskToText(task));
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (!text.trim()) return alert("O texto não pode estar vazio.");

    // Analisa o novo texto
    const parsedData = parseTextToTaskData(text);

    if (!parsedData.description) return alert("A tarefa precisa de uma descrição.");

    // Atualiza a tarefa original com os novos dados
    updateTask(task.id, {
      description: parsedData.description,
      time: parsedData.time, // Se undefined, o updateTask deve lidar ou podemos passar null/undefined explicitamente
      duration: parsedData.duration,
      tag: parsedData.tag || task.tag, // Se não definir tag, mantém a antiga ou limpa? Aqui assumo que se apagou do texto, quer apagar.
      groupTag: parsedData.groupTag || task.groupTag,
    });

    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Script copiado para a área de transferência!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Editar Tarefa (Script)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
          Edite os atributos usando a sintaxe:<br/>
          <code>- Texto &gt;Duração &gt;&gt;Horário [Tag] {`{Grupo}`}</code>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={handleCopy}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition"
          >
            <Copy size={18} /> Copiar
          </button>
          
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition shadow-sm"
          >
            <Save size={18} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}