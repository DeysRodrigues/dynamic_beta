import { useState, useCallback, memo, useMemo } from "react";
import {
  Plus,
  CheckCircle2,
  Copy,
  AppWindow,
  Code,
  Search,
  Heart,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import WidgetEditorModal from "@/components/layout/modals/WidgetEditorModal";
import {
  useCustomWidgetStore,
  type CustomWidget,
} from "@/store/useCustomWidgetStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { nativeWidgets, embedWidgets } from "@/data/widgetItems";
import ShinyText from "@/components/landing/ShinyText";

// --- COMPONENTES MEMOIZADOS ---

interface StoreItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  isActive: boolean;
  isFavorite: boolean;
  type: "native" | "embed";
  onAction: (id: string, path?: string) => void;
  onToggleFavorite: (id: string) => void;
}

const StoreItem = memo(({ item, isActive, isFavorite, type, onAction, onToggleFavorite }: StoreItemProps) => {
  return (
    <div className="box-padrao flex flex-col justify-between p-5 min-h-[160px] relative group">
      <button 
        onClick={() => onToggleFavorite(item.id)}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-current/10 z-10 ${isFavorite ? "text-red-500 scale-110" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`}
      >
        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <div>
        <div
          className={`mb-3 p-3 rounded-xl shadow-sm inline-block ${item.color}`}
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
            : "bg-current/5 hover:bg-primary hover:text-primary-foreground"
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
  isFavorite: boolean;
  onCopy: (id: string) => void;
  onEdit: (w: CustomWidget) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const CustomStoreItem = memo(
  ({ widget, isCopied, isFavorite, onCopy, onEdit, onDelete, onToggleFavorite }: CustomStoreItemProps) => {
    return (
      <div className="box-padrao p-5 flex flex-col justify-between relative group">
        <button 
          onClick={() => onToggleFavorite(widget.id)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-current/10 z-10 ${isFavorite ? "text-red-500 scale-110" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>

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

export default function WidgetsStorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [added, setAdded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingWidget, setEditingWidget] = useState<CustomWidget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { favoriteWidgets, toggleWidgetFavorite } = useFavoriteStore(
    useShallow((state) => ({
      favoriteWidgets: state.favoriteWidgets,
      toggleWidgetFavorite: state.toggleWidgetFavorite,
    }))
  );

  const { customWidgets, deleteCustomWidget } = useCustomWidgetStore(
    useShallow((state) => ({
      customWidgets: state.widgets,
      deleteCustomWidget: state.deleteWidget,
    }))
  );

  const addBox = useDashboardStore((state) => state.addBox);

  const handleAddNative = useCallback((id: string) => {
    addBox(id);
    setAdded(id);
    setTimeout(() => setAdded(null), 2000);
  }, [addBox]);

  const handleCopyEmbed = useCallback((id: string, path?: string) => {
    if (!path) return;
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleCopyCustom = useCallback((id: string) => {
    const url = `${window.location.origin}/w/custom/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const openCreator = () => {
    setEditingWidget(null);
    setIsModalOpen(true);
  };

  const openEditor = (widget: CustomWidget) => {
    setEditingWidget(widget);
    setIsModalOpen(true);
  };

  const filteredNative = useMemo(() => 
    nativeWidgets.filter(w => 
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const filteredEmbed = useMemo(() => 
    embedWidgets.filter(w => 
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const filteredCustom = useMemo(() => 
    customWidgets.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [customWidgets, searchQuery]);

  const favNative = useMemo(() => nativeWidgets.filter(w => favoriteWidgets.includes(w.id)), [favoriteWidgets]);
  const favEmbed = useMemo(() => embedWidgets.filter(w => favoriteWidgets.includes(w.id)), [favoriteWidgets]);
  const favCustom = useMemo(() => customWidgets.filter(w => favoriteWidgets.includes(w.id)), [customWidgets, favoriteWidgets]);

  const hasFavorites = favNative.length > 0 || favEmbed.length > 0 || favCustom.length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-transparent">
       {/* Background Ambient */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[15%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-7xl space-y-12 pt-10 pb-32 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border shrink-0 transition-colors duration-500"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                    color: 'var(--primary)'
                 }}>
               <ShoppingBag size={28} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 opacity-60"
                   style={{ color: 'var(--primary)' }}>
                 <Sparkles size={10} /> Marketplace
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  <ShinyText text="Loja de Widgets" disabled={false} speed={3} />
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 p-1.5 rounded-2xl backdrop-blur-sm border transition-colors duration-500 flex-1 md:flex-none"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
                 }}>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-none outline-none font-medium"
                />
              </div>
            </div>

            <button
              onClick={openCreator}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg w-full sm:w-auto"
            >
              <Code size={18} strokeWidth={3} /> Criar HTML
            </button>
          </div>
        </div>

        {/* SEÇÃO DE FAVORITOS */}
        {hasFavorites && (
          <section className="space-y-6 pb-8">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500 fill-red-500" size={24} />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Meus Favoritos</h2>
                <p className="text-xs sm:text-sm opacity-60">Seus widgets preferidos em um só lugar.</p>
              </div>
            </div>

            {favNative.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-[10px] sm:text-sm font-bold opacity-50 uppercase tracking-wider">Nativos</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favNative.map((w) => (
                    <StoreItem
                      key={w.id}
                      item={w}
                      type="native"
                      isActive={added === w.id}
                      isFavorite={true}
                      onAction={handleAddNative}
                      onToggleFavorite={toggleWidgetFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {favEmbed.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-[10px] sm:text-sm font-bold opacity-50 uppercase tracking-wider">Embeds</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favEmbed.map((w) => (
                    <StoreItem
                      key={w.id}
                      item={w}
                      type="embed"
                      isActive={copied === w.id}
                      isFavorite={true}
                      onAction={handleCopyEmbed}
                      onToggleFavorite={toggleWidgetFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {favCustom.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-[10px] sm:text-sm font-bold opacity-50 uppercase tracking-wider">Customizados</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favCustom.map((w) => (
                    <CustomStoreItem
                      key={w.id}
                      widget={w}
                      isCopied={copied === w.id}
                      isFavorite={true}
                      onCopy={handleCopyCustom}
                      onEdit={openEditor}
                      onDelete={deleteCustomWidget}
                      onToggleFavorite={toggleWidgetFavorite}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 1. WIDGETS NATIVOS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Nativos do Sistema</h2>
              <p className="text-xs sm:text-sm opacity-60">
                Widgets integrados que você pode adicionar diretamente.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNative.map((w) => (
              <StoreItem
                key={w.id}
                item={w}
                type="native"
                isActive={added === w.id}
                isFavorite={favoriteWidgets.includes(w.id)}
                onAction={handleAddNative}
                onToggleFavorite={toggleWidgetFavorite}
              />
            ))}
          </div>
        </section>

        {/* 2. EMBED WIDGETS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <AppWindow className="text-purple-500" size={24} />
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Embeds Especiais</h2>
              <p className="text-xs sm:text-sm opacity-60">
                Copie o link e cole dentro de um widget "Smart Embed".
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmbed.map((w) => (
              <StoreItem
                key={w.id}
                item={w}
                type="embed"
                isActive={copied === w.id}
                isFavorite={favoriteWidgets.includes(w.id)}
                onAction={handleCopyEmbed}
                onToggleFavorite={toggleWidgetFavorite}
              />
            ))}
          </div>
        </section>

        {/* 3. WIDGETS CUSTOMIZADOS */}
        {customWidgets.length > 0 && (
          <section className="space-y-4 pt-8">
            <div className="flex items-center gap-2">
              <Code className="text-amber-500" size={24} />
              <h2 className="text-lg sm:text-xl font-bold">Meus HTML Widgets</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustom.map((w) => (
                <CustomStoreItem
                  key={w.id}
                  widget={w}
                  isCopied={copied === w.id}
                  isFavorite={favoriteWidgets.includes(w.id)}
                  onCopy={handleCopyCustom}
                  onEdit={openEditor}
                  onDelete={deleteCustomWidget}
                  onToggleFavorite={toggleWidgetFavorite}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <WidgetEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        widgetToEdit={editingWidget}
      />
    </div>
  );
}
