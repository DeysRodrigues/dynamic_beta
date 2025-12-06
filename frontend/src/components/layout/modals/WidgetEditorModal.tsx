import { useState, useEffect } from "react";
import { X, Save, Play, Code, FileCode, FileJson } from "lucide-react";
import { useCustomWidgetStore, type CustomWidget } from "@/store/useCustomWidgetStore";

interface WidgetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetToEdit?: CustomWidget | null;
}

export default function WidgetEditorModal({ isOpen, onClose, widgetToEdit }: WidgetEditorModalProps) {
  const { saveWidget } = useCustomWidgetStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [html, setHtml] = useState("<h1>Olá Mundo!</h1>");
  const [css, setCss] = useState("h1 { color: #6366f1; text-align: center; margin-top: 20%; }");
  const [js, setJs] = useState("console.log('Widget carregado!');");
  
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [previewKey, setPreviewKey] = useState(0); // Força refresh do iframe

  // Carrega dados se estiver editando
  useEffect(() => {
    if (widgetToEdit) {
      setName(widgetToEdit.name);
      setDescription(widgetToEdit.description);
      setHtml(widgetToEdit.html);
      setCss(widgetToEdit.css);
      setJs(widgetToEdit.js);
    } else {
      // Reset para criar novo
      setName("");
      setDescription("");
      setHtml("<h1>Olá Mundo!</h1>");
      setCss("h1 { color: #6366f1; text-align: center; margin-top: 20%; }");
      setJs("");
    }
  }, [widgetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return alert("Dê um nome ao seu widget.");

    const newWidget: CustomWidget = {
      id: widgetToEdit?.id || `custom-${Date.now()}`,
      name,
      description,
      html,
      css,
      js,
      updatedAt: new Date().toISOString(),
    };

    saveWidget(newWidget);
    onClose();
    alert("Widget salvo com sucesso!");
  };

  // Preview em tempo real (montado localmente)
  const srcDoc = `
    <html>
      <head><style>body{margin:0;font-family:sans-serif;}${css}</style></head>
      <body>${html}<script>${js}</script></body>
    </html>
  `;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full h-full max-w-6xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 w-1/2">
             <div className="bg-indigo-600 p-2 rounded-lg text-white">
               <Code size={20} />
             </div>
             <div className="w-full">
               <input 
                  type="text" 
                  placeholder="Nome do Widget (ex: Relógio Digital)" 
                  className="w-full bg-transparent font-bold text-gray-800 outline-none placeholder:text-gray-400"
                  value={name}
                  onChange={e => setName(e.target.value)}
               />
               <input 
                  type="text" 
                  placeholder="Pequena descrição..." 
                  className="w-full bg-transparent text-xs text-gray-500 outline-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
               />
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition">
              <Save size={18} /> Salvar Widget
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Corpo: Editor + Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Coluna Editor */}
          <div className="w-full md:w-1/2 flex flex-col border-r border-gray-200 bg-gray-900 text-gray-300">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-gray-800">
              <button 
                onClick={() => setActiveTab("html")}
                className={`flex-1 py-3 text-sm font-mono flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'html' ? 'border-orange-500 text-white bg-gray-700' : 'border-transparent hover:bg-gray-700'}`}
              >
                <FileCode size={14} className="text-orange-500"/> HTML
              </button>
              <button 
                onClick={() => setActiveTab("css")}
                className={`flex-1 py-3 text-sm font-mono flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'css' ? 'border-blue-500 text-white bg-gray-700' : 'border-transparent hover:bg-gray-700'}`}
              >
                <FileCode size={14} className="text-blue-500"/> CSS
              </button>
              <button 
                onClick={() => setActiveTab("js")}
                className={`flex-1 py-3 text-sm font-mono flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'js' ? 'border-yellow-500 text-white bg-gray-700' : 'border-transparent hover:bg-gray-700'}`}
              >
                <FileJson size={14} className="text-yellow-500"/> JS
              </button>
            </div>

            {/* Area de Texto */}
            <textarea
              className="flex-1 w-full bg-gray-900 p-4 font-mono text-sm outline-none resize-none custom-scrollbar leading-relaxed"
              value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
              onChange={(e) => {
                const v = e.target.value;
                if(activeTab === 'html') setHtml(v);
                else if(activeTab === 'css') setCss(v);
                else setJs(v);
              }}
              spellCheck={false}
              placeholder={`Digite seu código ${activeTab.toUpperCase()} aqui...`}
            />
          </div>

          {/* Coluna Preview */}
          <div className="w-full md:w-1/2 flex flex-col bg-gray-100">
             <div className="p-2 bg-gray-200 border-b border-gray-300 flex justify-between items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
               <span>Preview</span>
               <button onClick={() => setPreviewKey(k => k + 1)} className="flex items-center gap-1 hover:text-indigo-600">
                 <Play size={14} /> Atualizar
               </button>
             </div>
             <div className="flex-1 relative bg-white bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
                <iframe 
                  key={previewKey}
                  srcDoc={srcDoc}
                  className="w-full h-full border-none"
                  title="Preview"
                  sandbox="allow-scripts allow-modals"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}