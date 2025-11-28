import { Upload, X, FileJson } from "lucide-react";


// Definindo a interface do JSON esperado (pode ser parcial)
interface ImportedTaskJSON {
  description: string;
  time: string;
  tag?: string;
  duration?: string | number;
}

interface TasksImportBoxProps {
  onImport: (tasks: ImportedTaskJSON[]) => void;
  onClose: () => void;
}

export default function TasksImportBox({ onImport, onClose }: TasksImportBoxProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === "string") {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            onImport(parsed);
          } else {
            alert("O arquivo deve conter um array de tarefas (JSON).");
          }
        }
      } catch (err) {
        console.error("Erro na importação:", err);
        alert("Erro ao ler o arquivo. Verifique se é um JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="box-padrao relative animate-in fade-in zoom-in duration-200 border border-indigo-100">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="bg-indigo-50 p-3 rounded-full mb-3 text-indigo-600">
          <FileJson size={32} />
        </div>
        
        <h2 className="text-lg font-bold text-gray-800 mb-2">Importar Tarefas</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-[250px]">
          Selecione um arquivo <code>.json</code> contendo sua lista de tarefas backup.
        </p>

        <label className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer transition shadow-sm font-medium">
          <Upload size={18} />
          Selecionar Arquivo
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}