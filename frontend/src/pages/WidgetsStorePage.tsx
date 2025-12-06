import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  LayoutTemplate,
  Copy,
  AppWindow,
  Code,
} from "lucide-react";

import WidgetEditorModal from "@/components/layout/modals/WidgetEditorModal";
import {
  useCustomWidgetStore,
  type CustomWidget,
} from "@/store/useCustomWidgetStore";
import { useDashboardStore } from "@/store/useDashboardStore";

// Import apenas Widgets
import { nativeWidgets, embedWidgets } from "@/data/widgetItems";

export default function WidgetsStorePage() {
  const { addBox } = useDashboardStore();
  const { widgets: customWidgets, deleteWidget } = useCustomWidgetStore();

  const [added, setAdded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<CustomWidget | null>(null);

  const handleAddNative = (id: string) => {
    addBox(id);
    setAdded(id);
    setTimeout(() => setAdded(null), 1500);
  };

  const handleCopyEmbed = (path: string, id: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openCreator = () => {
    setEditingWidget(null);
    setIsEditorOpen(true);
  };
  const openEditor = (w: CustomWidget) => {
    setEditingWidget(w);
    setIsEditorOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm("Apagar widget?")) deleteWidget(id);
  };

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20"
      style={{ color: "var(--box-text-color)" }}
    >
      <WidgetEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        widgetToEdit={editingWidget}
      />

      <div className="bar-padrao flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Loja de Widgets</h1>
          <p className="opacity-70 mt-1">
            Adicione funcionalidades ao seu dashboard.
          </p>
        </div>
        <button
          onClick={openCreator}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl hover:opacity-90 transition shadow-lg font-bold"
        >
          <Code size={20} /> Criar HTML
        </button>
      </div>

      {/* 1. WIDGETS NATIVOS (Instalação Direta) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-current/10 pb-2">
          <LayoutTemplate className="text-primary" size={24} />
          <div>
            <h2 className="text-xl font-bold">Nativos do Sistema</h2>
            <p className="text-sm opacity-60">
              Widgets integrados que você pode adicionar diretamente.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nativeWidgets.map((w) => (
            <div
              key={w.id}
              className="box-padrao flex flex-col justify-between p-5 min-h-[160px]"
            >
              <div>
                <div
                  className={`mb-3 p-3 rounded-xl shadow-sm inline-block border ${w.color}`}
                >
                  {w.icon}
                </div>
                <h3 className="font-bold text-lg">{w.title}</h3>
                <p className="text-sm opacity-60 mb-4">{w.description}</p>
              </div>
              <button
                onClick={() => handleAddNative(w.id)}
                className={`w-full py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                  added === w.id
                    ? "bg-green-500 text-white"
                    : "bg-current/5 border border-current/10 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                }`}
              >
                {added === w.id ? (
                  <>
                    <CheckCircle2 size={16} /> Adicionado!
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Adicionar
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 2. EMBED WIDGETS (Copiar Link) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-current/10 pb-2">
          <AppWindow className="text-purple-500" size={24} />
          <div>
            <h2 className="text-xl font-bold">Embeds Especiais</h2>
            <p className="text-sm opacity-60">
              Copie o link e cole dentro de um widget "Smart Embed" ou "Janela".
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {embedWidgets.map((w) => (
            <div
              key={w.id}
              className="box-padrao flex flex-col justify-between p-5 min-h-[160px]"
            >
              <div>
                <div
                  className={`mb-3 p-3 rounded-xl shadow-sm inline-block border ${w.color}`}
                >
                  {w.icon}
                </div>
                <h3 className="font-bold text-lg">{w.title}</h3>
                <p className="text-sm opacity-60 mb-4">{w.description}</p>
              </div>
              <button
                onClick={() => handleCopyEmbed(w.path, w.id)}
                className={`w-full py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                  copied === w.id
                    ? "bg-green-500 text-white"
                    : "bg-current/5 border border-current/10 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {copied === w.id ? (
                  <>
                    <CheckCircle2 size={16} /> Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copiar Link
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WIDGETS CUSTOMIZADOS (Criados pelo Usuário) */}
      {customWidgets.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-current/10">
          <div className="flex items-center gap-2">
            <Code className="text-amber-500" size={24} />
            <h2 className="text-xl font-bold">Meus HTML Widgets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customWidgets.map((w) => (
              <div
                key={w.id}
                className="box-padrao p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg">{w.name}</h3>
                  <p className="text-xs opacity-60 line-clamp-2">
                    {w.description}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleCopyEmbed(`/w/custom/${w.id}`, w.id)}
                    className="flex-1 py-2 bg-current/5 rounded-lg text-xs font-bold hover:bg-primary/10 hover:text-primary transition"
                  >
                    {copied === w.id ? "Copiado!" : "Copiar URL"}
                  </button>
                  <button
                    onClick={() => openEditor(w)}
                    className="p-2 bg-current/5 rounded-lg hover:bg-primary/10 hover:text-primary transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
