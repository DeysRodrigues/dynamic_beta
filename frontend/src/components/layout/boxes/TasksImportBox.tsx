import { Upload } from "lucide-react";
import React from "react";

interface Task {
  title: string;
  tag: string;
  date: string;
}

const TasksImportBox: React.FC = () => {
  return (
    <div className="bg-gray-100 rounded-3xl p-6 shadow flex flex-col gap-4 overflow-hidden h-full w-full">
      <h2 className="text-lg font-semibold">Importar Tasks via JSON</h2>

      <p className="text-sm text-gray-600">
        Aqui você poderá importar um arquivo JSON com suas tasks, contendo tags e datas.
      </p>

      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded hover:opacity-90">
        <Upload size={18} />
        Importar JSON
      </button>

      {/* Lista de Tasks simulada ou vazia por enquanto */}
      <div className="mt-4 flex flex-col gap-2 max-h-40 overflow-y-auto">
        <div className="p-2 bg-white rounded shadow flex justify-between items-center">
          <span className="font-semibold">Task de exemplo</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Leitura</span>
          <span className="text-xs text-gray-500">01/07/2025</span>
        </div>
      </div>
    </div>
  );
};

export default TasksImportBox;
