import { useState, useCallback, memo } from "react";
import {
  Plus,
  CheckCircle2,
  LayoutTemplate,
  Copy,
  AppWindow,
  Code,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import WidgetEditorModal from "@/components/layout/modals/WidgetEditorModal";
import {
  useCustomWidgetStore,
  type CustomWidget,
} from "@/store/useCustomWidgetStore";
import { useDashboardStore } from "@/store/useDashboardStore";

import { nativeWidgets, embedWidgets } from "@/data/widgetItems";

// --- COMPONENTES MEMOIZADOS (Previnem re-render da lista inteira) ---

interface StoreItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  isActive: boolean;
  type: "native" | "embed";
  onAction: (id: string, path?: string) => void;
}

const StoreItem = memo(({ item, isActive, type, onAction }: StoreItemProps) => {
  return (
    <div className="box-padrao flex flex-col justify-between p-5 min-h-[160px]">
      <div>
        <div
          className={`mb-3 p-3 rounded-xl shadow-sm inline-block border ${item.color}`}
        >
          {item.icon}
        </div>
        <h3 className="font-bold text-lg">{item.title}</h3>
        <p className="text-sm opacity-60 mb-4">{item.description}</p>
      </div>
      <button
        onClick={() => onAction(item.id, item.path)}
        className={`w-full py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
          isActive
            ? "bg-green-500 text-white"
            : "bg-current/5 border border-current/10 hover:bg-primary hover:text-primary-foreground hover:border-primary"
        }`}
      >
        {isActive ? (
          <>
            <CheckCircle2 size={16} />{" "}
            {type === "native" ? "Adicionado!" : "Link Copiado!"}
          </>
        ) : (
          <>
            {type === "native" ? <Plus size={16} /> : <Copy size={16} />}
            {type === "native" ? "Adicionar" : "Copiar Link"}
          </>
        )}
      </button>
    </div>
  );
});

interface CustomStoreItemProps {
  widget: CustomWidget;
  isCopied: boolean;
  onCopy: (id: string) => void;
  onEdit: (w: CustomWidget) => void;
  onDelete: (id: string) => void;
}

const CustomStoreItem = memo(
  ({ widget, isCopied, onCopy, onEdit, onDelete }: CustomStoreItemProps) => {
    return (
      <div className="box-padrao p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg">{widget.name}</h3>
          <p className="text-xs opacity-60 line-clamp-2">
            {widget.description}
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onCopy(widget.id)}
            className="flex-1 py-2 bg-current/5 rounded-lg text-xs font-bold hover:bg-primary/10 hover:text-primary transition"
          >
            {isCopied ? "Copiado!" : "Copiar URL"}
          </button>
          <button
            onClick={() => onEdit(widget)}
            className="p-2 bg-current/5 rounded-lg hover:bg-primary/10 hover:text-primary transition"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(widget.id)}
            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            X
          </button>
        </div>
      </div>
    );
  }
);

// --- PÁGINA PRINCIPAL ---

export default function WidgetsStorePage() {
  // 1. OTIMIZAÇÃO: Seletores granulares com useShallow
  const addBox = useDashboardStore((state) => state.addBox);
  const { widgets: customWidgets, deleteWidget } = useCustomWidgetStore(
    useShallow((state) => ({
      widgets: state.widgets,
      deleteWidget: state.deleteWidget,
    }))
  );

  const [added, setAdded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<CustomWidget | null>(null);

  // 2. OTIMIZAÇÃO: Callbacks estáveis para não quebrar o React.memo dos filhos
  const handleAddNative = useCallback(
    (id: string) => {
      addBox(id);
      setAdded(id);
      setTimeout(() => setAdded(null), 1500);
    },
    [addBox]
  );

  const handleCopyEmbed = useCallback((id: string, path?: string) => {
    if (!path) return;
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleCopyCustom = useCallback((id: string) => {
    const fullUrl = `${window.location.origin}/w/custom/${id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleDeleteCustom = useCallback(
    (id: string) => {
      if (confirm("Apagar widget?")) deleteWidget(id);
    },
    [deleteWidget]
  );

  const openCreator = useCallback(() => {
    setEditingWidget(null);
    setIsEditorOpen(true);
  }, []);

  const openEditor = useCallback((w: CustomWidget) => {
    setEditingWidget(w);
    setIsEditorOpen(true);
  }, []);

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

      {/* 1. WIDGETS NATIVOS */}
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
            <StoreItem
              key={w.id}
              item={w}
              type="native"
              isActive={added === w.id}
              onAction={handleAddNative}
            />
          ))}
        </div>
      </section>

      {/* 2. EMBED WIDGETS */}
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
            <StoreItem
              key={w.id}
              item={w}
              type="embed"
              isActive={copied === w.id}
              onAction={handleCopyEmbed}
            />
          ))}
        </div>
      </section>

      {/* 3. WIDGETS CUSTOMIZADOS */}
      {customWidgets.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-current/10">
          <div className="flex items-center gap-2">
            <Code className="text-amber-500" size={24} />
            <h2 className="text-xl font-bold">Meus HTML Widgets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customWidgets.map((w) => (
              <CustomStoreItem
                key={w.id}
                widget={w}
                isCopied={copied === w.id}
                onCopy={handleCopyCustom}
                onEdit={openEditor}
                onDelete={handleDeleteCustom}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
