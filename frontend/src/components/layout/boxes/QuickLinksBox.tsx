import { useState } from "react";
import { 
  Plus, Trash2, ExternalLink, 
  FolderPlus, Globe, X, Link, Search,
  LayoutGrid, List // 1. Novos ícones
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useThemeStore } from "@/store/useThemeStore";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  links: LinkItem[];
}

const DEFAULT_DATA: Category[] = [
  { 
    id: "trabalho", 
    name: "Trabalho", 
    links: [
      { id: "1", title: "Figma", url: "https://figma.com" },
      { id: "2", title: "GitHub", url: "https://github.com" },
    ] 
  }
];

export default function QuickLinksBox({ id = "quicklinks-default" }: { id?: string }) {
  const { getBoxContent, setBoxContent } = useBoxContentStore();
  const primaryColor = useThemeStore((s) => s.primaryColor);
  const saved = getBoxContent(id);

  const [categories, setCategories] = useState<Category[]>(saved.categories || DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || "");
  
  // 2. Estado do Modo de Visualização (Salvo no boxContent também)
  const [viewMode, setViewMode] = useState<"list" | "grid">(saved.viewMode || "list");

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const save = (data: Category[], mode: "list" | "grid" = viewMode) => {
    setCategories(data);
    setBoxContent(id, { categories: data, viewMode: mode });
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "list" ? "grid" : "list";
    setViewMode(newMode);
    setBoxContent(id, { categories, viewMode: newMode });
  };

  const addCategory = () => {
    const name = prompt("Nome da nova aba:");
    if (!name) return;
    const newCat: Category = { id: crypto.randomUUID(), name, links: [] };
    const updated = [...categories, newCat];
    save(updated);
    setActiveTab(newCat.id);
  };

  const deleteCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    if (categories.length === 1) return alert("Mínimo de 1 aba necessária.");
    if (confirm("Apagar aba e links?")) {
      const updated = categories.filter(c => c.id !== catId);
      save(updated);
      if (activeTab === catId) setActiveTab(updated[0].id);
    }
  };

  const addLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    let finalUrl = newLinkUrl;
    if (!finalUrl.startsWith("http")) finalUrl = `https://${finalUrl}`;

    const newLink: LinkItem = { id: crypto.randomUUID(), title: newLinkTitle, url: finalUrl };
    const updated = categories.map(cat => {
      if (cat.id === activeTab) return { ...cat, links: [...cat.links, newLink] };
      return cat;
    });

    save(updated);
    setIsAddingLink(false);
    setNewLinkTitle(""); setNewLinkUrl("");
  };

  const deleteLink = (e: React.MouseEvent, linkId: string) => {
    e.preventDefault(); // Evita abrir o link ao deletar no modo grid
    e.stopPropagation();
    const updated = categories.map(cat => {
      if (cat.id === activeTab) return { ...cat, links: cat.links.filter(l => l.id !== linkId) };
      return cat;
    });
    save(updated);
  };

  const getFavicon = (url: string, size = 64) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
    } catch { return null; }
  };

  const currentCategory = categories.find(c => c.id === activeTab) || categories[0];

  return (
    <div className="box-padrao flex flex-col p-0 overflow-hidden relative group">
      
      {/* HEADER DAS ABAS + CONTROLES */}
      <div className="p-2 bg-current/5 sticky top-0 z-10 flex justify-between items-center gap-2">
        
        {/* Lista de Abas */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right flex-1">
          {categories.map(cat => {
            const isActive = activeTab === cat.id;
            return (
              <div 
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={isActive ? { color: primaryColor, backgroundColor: `${primaryColor}15` } : {}}
                className={`
                  relative px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap group/tab select-none
                  ${!isActive ? "opacity-60 hover:opacity-100 hover:bg-current/5" : ""}
                `}
              >
                {cat.name}
                <button 
                  onClick={(e) => deleteCategory(e, cat.id)}
                  className={`opacity-0 group-hover/tab:opacity-100 hover:text-red-500 transition ml-1 -mr-1 ${categories.length === 1 ? "hidden" : ""}`}
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            );
          })}
          
          <button onClick={addCategory} className="p-1.5 ml-1 rounded-lg opacity-40 hover:opacity-100 hover:bg-current/10 transition">
            <FolderPlus size={14} />
          </button>
        </div>

        {/* 3. Botão Toggle View (Lista/Grid) */}
        <button 
          onClick={toggleViewMode}
          className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-current/10 transition shrink-0"
          title={viewMode === "list" ? "Mudar para Ícones" : "Mudar para Lista"}
        >
          {viewMode === "list" ? <LayoutGrid size={16} /> : <List size={16} />}
        </button>

      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        
        {/* RENDERIZAÇÃO CONDICIONAL: GRID vs LISTA */}
        {viewMode === "list" ? (
          
          // --- MODO LISTA (Visual Detalhado) ---
          <div className="space-y-2">
            {currentCategory?.links.map(link => (
              <div key={link.id} className="group/link relative flex items-center justify-between p-2.5 rounded-xl bg-current/5 hover:bg-current/10 transition-all duration-300">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 flex-1 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0 shadow-inner">
                    <img src={getFavicon(link.url) || ""} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-5 h-5 rounded-sm object-contain" alt="" />
                    <Globe size={14} className="opacity-30 absolute z-[-1]" />
                  </div>
                  <div className="flex flex-col overflow-hidden justify-center">
                    <span className="text-xs font-bold opacity-90 truncate leading-tight">{link.title}</span>
                    <span className="text-[10px] font-mono truncate opacity-40 group-hover/link:opacity-70 transition-opacity">{link.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </div>
                </a>
                <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300">
                  <button onClick={(e) => deleteLink(e, link.id)} className="p-1.5 opacity-50 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 size={14} /></button>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 opacity-50 hover:opacity-100 hover:bg-current/10 rounded-lg transition"><ExternalLink size={14} /></a>
                </div>
              </div>
            ))}
          </div>

        ) : (
          
          // --- MODO GRADE (Só Ícones) ---
          <div className="grid grid-cols-4 gap-2">
            {currentCategory?.links.map(link => (
              <a 
                key={link.id}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/grid relative aspect-square flex flex-col items-center justify-center rounded-xl bg-current/5 hover:bg-current/10 transition-all hover:scale-105"
                title={link.title}
              >
                {/* Ícone Grande */}
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-current/5 shadow-inner mb-1">
                  <img src={getFavicon(link.url, 128) || ""} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-6 h-6 object-contain drop-shadow-sm" alt="" />
                  <Globe size={20} className="opacity-20 absolute z-[-1]" />
                </div>
                
                {/* Texto Pequeno */}
                <span className="text-[9px] font-medium opacity-60 group-hover/grid:opacity-100 truncate w-full text-center px-1">
                  {link.title}
                </span>

                {/* Botão Deletar (Aparece no topo direito) */}
                <button 
                  onClick={(e) => deleteLink(e, link.id)}
                  className="absolute top-1 right-1 p-1 rounded-md text-red-400 opacity-0 group-hover/grid:opacity-100 hover:bg-red-500/20 transition-all scale-75 hover:scale-100"
                >
                  <X size={14} />
                </button>
              </a>
            ))}
             {/* Card Fantasma para adicionar no modo grid */}
             <button 
                onClick={() => setIsAddingLink(true)}
                className="aspect-square flex flex-col items-center justify-center rounded-xl text-current opacity-30 hover:opacity-100 transition-all"
                title="Adicionar Link"
             >
                <Plus size={20} />
             </button>
          </div>
        )}

        {/* INPUT AREA (Comum aos dois modos) */}
        {isAddingLink ? (
          <div className="p-3 bg-current/5 rounded-xl animate-in zoom-in-95 duration-200 mt-2 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 pb-1">
              <Search size={14} style={{ color: primaryColor }} />
              <input autoFocus placeholder="Título" className="flex-1 bg-transparent text-xs p-1 outline-none placeholder-current/30" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Link size={14} style={{ color: primaryColor }} />
              <input placeholder="URL" className="flex-1 bg-transparent text-xs p-1 outline-none font-mono placeholder-current/30" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addLink} style={{ backgroundColor: primaryColor }} className="flex-1 text-white text-[10px] font-bold py-1.5 rounded-lg transition shadow-md hover:opacity-90">ADICIONAR</button>
              <button onClick={() => setIsAddingLink(false)} className="px-4 bg-current/10 hover:bg-current/20 opacity-70 hover:opacity-100 text-[10px] font-bold py-1.5 rounded-lg transition">CANCELAR</button>
            </div>
          </div>
        ) : (
          // Botão de adicionar (Só aparece no modo lista, pois no grid coloquei um card dedicado)
          viewMode === "list" && (
            <button 
              onClick={() => setIsAddingLink(true)}
              className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-xs font-bold opacity-30 hover:opacity-100 rounded-xl transition-all group"
              style={{ color: primaryColor }}
            >
              <div className="bg-current/10 p-1 rounded-md transition-colors text-inherit"><Plus size={12} strokeWidth={3} /></div>
              <span className="text-current">Novo Link</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}