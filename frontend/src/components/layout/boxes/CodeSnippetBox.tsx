import { useState, useRef, useEffect } from "react";
import { 
  Code, Copy, Plus, Trash2, Check, 
  Terminal, Database, FileJson, Layers, Command,
  ChevronDown, Search, Hash, X, Coffee, FileCode // Adicionei novos ícones
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useThemeStore } from "@/store/useThemeStore";

// --- TIPOS ---
interface SnippetType {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  color: string;
  isCustom?: boolean;
}

interface Snippet {
  id: string;
  title: string;
  code: string;
  type: string;
}

// --- CONFIGURAÇÃO DOS PADRÕES ---
const DEFAULT_TYPES: SnippetType[] = [
  { id: "java", label: "Java", icon: Coffee, color: "text-red-500" },
  { id: "ts", label: "TypeScript", icon: Code, color: "text-blue-400" },
  { id: "js", label: "JavaScript", icon: FileJson, color: "text-yellow-400" },
  { id: "git", label: "Git", icon: Command, color: "text-orange-500" },
  { id: "css", label: "CSS", icon: Code, color: "text-pink-400" },
  { id: "html", label: "HTML", icon: FileCode, color: "text-orange-600" },
  { id: "shell", label: "Shell", icon: Terminal, color: "text-green-400" },
  { id: "arch", label: "Arch Term", icon: Terminal, color: "text-cyan-400" },
  { id: "docker", label: "Docker", icon: Layers, color: "text-blue-500" },
  { id: "sql", label: "SQL", icon: Database, color: "text-purple-400" },
];

const DEFAULT_SNIPPETS: Snippet[] = [
  { id: "1", title: "Atualizar Arch (pacman)", code: "sudo pacman -Syu", type: "arch" },
];

// Cores para novas linguagens criadas pelo user
const RANDOM_COLORS = [
  "text-red-400", "text-emerald-400", "text-indigo-400", 
  "text-fuchsia-400", "text-rose-400", "text-sky-400"
];

export default function CodeSnippetBox({ id = "snippet-default" }: { id?: string }) {
  const { getBoxContent, setBoxContent } = useBoxContentStore();
  const primaryColor = useThemeStore(s => s.primaryColor);
  const saved = getBoxContent(id);

  // Estados de Dados
  const [snippets, setSnippets] = useState<Snippet[]>(saved.snippets || DEFAULT_SNIPPETS);
  const [customTypes, setCustomTypes] = useState<SnippetType[]>(saved.customTypes || []);
  const [filter, setFilter] = useState<string>("all");
  
  // UI States
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form States
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("arch"); // Padrão selecionado
  
  // Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const allTypes = [...DEFAULT_TYPES, ...customTypes];
  const selectedTypeInfo = allTypes.find(t => t.id === selectedTypeId) || DEFAULT_TYPES[0];

  const save = (newSnippets: Snippet[], newCustomTypes: SnippetType[] = customTypes) => {
    setSnippets(newSnippets);
    setCustomTypes(newCustomTypes);
    setBoxContent(id, { snippets: newSnippets, customTypes: newCustomTypes });
  };

  const addSnippet = () => {
    if (!newTitle || !newCode) return;
    const newItem: Snippet = {
      id: crypto.randomUUID(),
      title: newTitle,
      code: newCode,
      type: selectedTypeId
    };
    save([newItem, ...snippets]);
    setIsAdding(false);
    setNewTitle(""); setNewCode(""); 
  };

  const deleteSnippet = (snippetId: string) => {
    if (confirm("Apagar este snippet?")) {
      save(snippets.filter(s => s.id !== snippetId));
    }
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    const newType: SnippetType = {
      id: newTypeName.toLowerCase().replace(/\s+/g, '-'),
      label: newTypeName,
      color: RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)],
      icon: null, 
      isCustom: true
    };

    const updatedCustoms = [...customTypes, newType];
    save(snippets, updatedCustoms);
    setSelectedTypeId(newType.id);
    setNewTypeName("");
    setIsAddingType(false);
  };

  const handleDeleteType = (e: React.MouseEvent, typeId: string) => {
    e.stopPropagation();
    if (confirm("Remover esta linguagem da lista?")) {
      const updatedCustoms = customTypes.filter(t => t.id !== typeId);
      save(snippets, updatedCustoms);
      if (selectedTypeId === typeId) setSelectedTypeId("arch");
    }
  };

  const copyToClipboard = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsAddingType(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const filteredSnippets = filter === "all" ? snippets : snippets.filter(s => s.type === filter);

  return (
    <div className="box-padrao flex flex-col p-0 overflow-hidden relative group">
      
      {/* HEADER & FILTER */}
      <div className="p-3 border-b border-current/10 bg-current/5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm flex items-center gap-2 opacity-80">
            <Terminal size={16} style={{ color: primaryColor }}/> Snippet Vault
          </h2>
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="p-1.5 rounded-md transition hover:opacity-100 opacity-60"
            style={{ backgroundColor: isAdding ? primaryColor : 'transparent', color: isAdding ? '#fff' : 'currentColor' }}
          >
            <Plus size={16} />
          </button>
        </div>

        {!isAdding && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-gradient-right">
            <button 
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition ${filter === "all" ? "bg-current/10 border-current/20 opacity-100" : "border-transparent opacity-40 hover:opacity-80"}`}
              style={filter === "all" ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Todos
            </button>
            {allTypes.map(t => {
              const Icon = t.icon || Hash; 
              return (
                <button 
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition flex items-center gap-1.5 ${filter === t.id ? `bg-current/10 border-current/20 opacity-100` : "border-transparent opacity-40 hover:opacity-80"}`}
                  style={filter === t.id ? { borderColor: primaryColor, color: primaryColor } : {}}
                >
                  <Icon size={12} className={filter === t.id ? "" : "grayscale opacity-70"} /> {t.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* FORMULÁRIO DE ADIÇÃO */}
      {isAdding && (
        <div className="p-3 bg-current/5 border-b border-current/10 animate-in slide-in-from-top-2 space-y-3 z-20 relative">
          
          <div className="flex gap-2">
            
            {/* DROPDOWN */}
            <div className="relative w-1/3" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-current/5 border border-current/10 rounded-lg px-3 py-1.5 text-xs h-9 outline-none transition-all hover:bg-current/10 active:scale-[0.98]"
                style={isDropdownOpen ? { borderColor: primaryColor } : {}}
              >
                <span className="font-bold truncate opacity-90">{selectedTypeInfo.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: primaryColor }} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-[#1e1e1e] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-56 flex flex-col">
                  
                  <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                    {allTypes.map((t) => {
                      const Icon = t.icon || Hash;
                      return (
                        <div
                          key={t.id}
                          onClick={() => { setSelectedTypeId(t.id); setIsDropdownOpen(false); }}
                          className="group/item px-2 py-1.5 text-xs cursor-pointer flex items-center justify-between hover:bg-white/10 rounded-md transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={12} className={selectedTypeId === t.id ? "" : "opacity-50 grayscale"} style={selectedTypeId === t.id ? { color: primaryColor } : {}} />
                            <span className={selectedTypeId === t.id ? "text-white font-bold" : "text-white/70"}>{t.label}</span>
                          </div>
                          
                          {t.isCustom && (
                            <button 
                              onClick={(e) => handleDeleteType(e, t.id)}
                              className="opacity-0 group-hover/item:opacity-100 p-1 text-white/30 hover:text-red-400 transition"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/10 p-2 bg-black/20">
                    {isAddingType ? (
                      <form onSubmit={handleCreateType} className="flex gap-1">
                        <input 
                          autoFocus
                          placeholder="Nome..."
                          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-white/30"
                          value={newTypeName}
                          onChange={e => setNewTypeName(e.target.value)}
                        />
                        <button type="submit" className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40">
                          <Check size={10} />
                        </button>
                      </form>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsAddingType(true); }}
                        className="w-full text-[10px] font-bold text-white/50 hover:text-white flex items-center justify-center gap-1 py-1 rounded hover:bg-white/5 transition"
                      >
                        <Plus size={10} /> Nova Linguagem
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input 
              placeholder="Título..." 
              className="flex-1 bg-current/5 border border-current/10 rounded-lg px-3 text-xs h-9 outline-none placeholder-current/30 focus:border-current/30 focus:ring-1 transition-all"
              style={{ '--tw-ring-color': primaryColor, caretColor: primaryColor } as React.CSSProperties}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
            />
          </div>

          <textarea 
            placeholder="Cole o código aqui..." 
            className="w-full h-24 bg-[#1e1e1e] text-blue-200 border border-current/10 rounded-lg p-3 text-xs font-mono outline-none resize-none placeholder-white/20 focus:border-white/20 transition-all custom-scrollbar"
            style={{ caretColor: primaryColor }}
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
          />

          <button 
            onClick={addSnippet} 
            className="w-full text-white py-2 rounded-lg text-xs font-bold transition shadow-md hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}
          >
            SALVAR SNIPPET
          </button>
        </div>
      )}

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-8 opacity-30 text-xs flex flex-col items-center gap-2">
            <Search size={24} />
            {snippets.length === 0 ? "Adicione seu primeiro snippet!" : "Nada encontrado."}
          </div>
        ) : (
          filteredSnippets.map(snippet => {
            const typeInfo = allTypes.find(t => t.id === snippet.type) || { label: snippet.type, color: "text-gray-400", icon: Hash };
            const Icon = typeInfo.icon || Hash;

            return (
              <div key={snippet.id} className="group relative bg-current/5 rounded-xl border border-current/5 hover:border-current/10 transition-all overflow-hidden">
                <div className="flex justify-between items-center px-3 py-2 bg-current/5 border-b border-current/5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Icon size={14} className={typeInfo.color} />
                    <span className="text-xs font-bold opacity-80 truncate">{snippet.title}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteSnippet(snippet.id)} className="p-1 hover:text-red-500 opacity-40 hover:opacity-100 transition"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="relative bg-[#1e1e1e] p-3 font-mono text-xs text-blue-200 overflow-x-auto whitespace-pre custom-scrollbar">
                  {snippet.code}
                  <button onClick={() => copyToClipboard(snippet.code, snippet.id)} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white/50 hover:text-white transition backdrop-blur-sm">
                    {copiedId === snippet.id ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}