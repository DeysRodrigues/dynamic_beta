import { useState } from "react";
import { X, Save, Download, Upload, Trash2, Layout, Check } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useLayoutTemplateStore, type LayoutTemplate } from "@/store/useLayoutTemplateStore";

interface LayoutManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LayoutManagerModal({ isOpen, onClose }: LayoutManagerModalProps) {
  const { boxes, layouts, loadDashboardState } = useDashboardStore();
  const { templates, saveTemplate, deleteTemplate, importTemplate } = useLayoutTemplateStore();
  
  const [newTemplateName, setNewTemplateName] = useState("");

  if (!isOpen) return null;

  // --- Salvar Atual ---
  const handleSaveCurrent = () => {
    if (!newTemplateName.trim()) return alert("Digite um nome para o modelo.");
    saveTemplate(newTemplateName, boxes, layouts);
    setNewTemplateName("");
  };

  // --- Carregar Modelo ---
  const handleLoad = (template: LayoutTemplate) => {
    if (window.confirm(`Substituir o layout atual pelo modelo "${template.name}"?`)) {
      loadDashboardState(template.boxes, template.layouts);
      onClose();
    }
  };

  // --- Exportar (Download JSON) ---
  const handleExport = (template: LayoutTemplate) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `layout-${template.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Importar (Upload JSON) ---
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === "string") {
          const parsed = JSON.parse(content);
          // Validação básica
          if (parsed.boxes && parsed.layouts && parsed.name) {
            importTemplate(parsed);
            alert(`Modelo "${parsed.name}" importado com sucesso!`);
          } else {
            alert("Arquivo inválido. O JSON não parece ser um modelo de layout.");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler arquivo.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layout className="text-indigo-600" /> Meus Modelos de Layout
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        {/* Salvar Novo */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
          <label className="text-sm font-semibold text-indigo-900">Salvar layout atual como modelo:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Modo Foco, Modo Estudo..."
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleSaveCurrent}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
            >
              <Save size={18} /> Salvar
            </button>
          </div>
        </div>

        {/* Importar */}
        <div className="flex justify-end">
          <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-200">
            <Upload size={16} /> Importar Arquivo .JSON
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        {/* Lista de Templates */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <Layout size={40} className="mx-auto mb-2 opacity-20" />
              <p>Nenhum modelo salvo ainda.</p>
            </div>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-indigo-200">
                <div>
                  <h3 className="font-bold text-gray-800">{t.name}</h3>
                  <p className="text-xs text-gray-500">
                    {t.boxes.length} widgets • Criado em {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleExport(t)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Exportar (Download)"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleLoad(t)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black flex items-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <Check size={16} /> Carregar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}