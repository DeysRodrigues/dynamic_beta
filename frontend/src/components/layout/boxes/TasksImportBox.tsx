import { Upload, X } from "lucide-react";

interface ImportedTask {
  description: string;
  tag: string;
  time: string;
  duration?: string | number;
}

interface TasksImportBoxProps {
  onImport: (tasks: ImportedTask[]) => void;
  onClose: () => void;
}

const TasksImportBox = ({ onImport, onClose }: TasksImportBoxProps) => {
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
            alert("Formato inválido. O JSON precisa ser um array de tasks.");
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        alert("Erro ao ler o arquivo.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="box-padrao">
      {/* Botão Fechar */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
      >
        <X size={18} />
      </button>

      <h2 className="text-lg font-semibold">Importar Tasks via JSON</h2>
      <p className="text-sm text-gray-600">
        Aqui você poderá importar um arquivo JSON com suas tasks, contendo
        descrição, tags e horários.
      </p>

      <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded hover:opacity-90 cursor-pointer">
        <Upload size={18} />
        Importar JSON
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default TasksImportBox;
