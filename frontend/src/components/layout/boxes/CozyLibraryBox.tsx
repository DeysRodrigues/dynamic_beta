import { useState } from "react";
import { 
  Plus, Settings2, Trash2, 
  Book, BookOpen, Library, GraduationCap, Heart, Star, 
  Briefcase, Coffee, Music, Gamepad2, Ghost, Rocket,
  Palette, Check, ExternalLink
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { cn } from "@/lib/utils";

// --- TIPOS ---
interface LibraryCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface LibraryBook {
  id: string;
  title: string;
  link?: string;
  categoryId: string;
  completed: boolean;
  color: string;
  height: number;
  pattern: number;
}

interface LibrarySettings {
  woodColor: string;
  wallColor: string;
}

// --- ÍCONES ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  book: Book, open: BookOpen, library: Library, school: GraduationCap,
  heart: Heart, star: Star, work: Briefcase, coffee: Coffee,
  music: Music, game: Gamepad2, ghost: Ghost, rocket: Rocket,
};

export default function CozyLibraryBox({ id = "library-default" }: { id?: string }) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const saved = getBoxContent(id);

  const defaultCategories: LibraryCategory[] = [
    { id: "1", name: "Geral", icon: "library", color: "var(--book-color-1)" }
  ];

  const [categories, setCategories] = useState<LibraryCategory[]>(saved.categories || defaultCategories);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialBooks = (saved.books || []).map((b: any) => ({
    ...b,
    categoryId: b.categoryId || categories[0].id
  }));

  const [books, setBooks] = useState<LibraryBook[]>(initialBooks);
  const [settings, setSettings] = useState<LibrarySettings>(saved.settings || { 
    woodColor: "var(--wood-1)", 
    wallColor: "transparent"
  });

  // UI States
  const [activeTab, setActiveTab] = useState<string>(categories[0].id);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showIconMenu, setShowIconMenu] = useState(false);

  // Inputs
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookLink, setNewBookLink] = useState("");
  const [newBookColor, setNewBookColor] = useState("#e76f51"); 
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("book");

  // --- ACTIONS ---
  const save = (_books = books, _categories = categories, _settings = settings) => {
    setBooks(_books);
    setCategories(_categories);
    setSettings(_settings);
    setBoxContent(id, { books: _books, categories: _categories, settings: _settings });
  };

  const addBook = () => {
    if (!newBookTitle.trim()) return;
    const newBook: LibraryBook = {
      id: crypto.randomUUID(),
      title: newBookTitle,
      link: newBookLink.trim() || undefined,
      categoryId: activeTab,
      completed: false,
      color: newBookColor,
      height: 35 + Math.floor(Math.random() * 25),
      pattern: Math.floor(Math.random() * 4)
    };
    save([...books, newBook]);
    setNewBookTitle(""); 
    setNewBookLink(""); 
    setNewBookColor(`#${Math.floor(Math.random()*16777215).toString(16)}`);
    setIsAddingBook(false);
  };

  const updateBookColor = (bookId: string, color: string) => {
    save(books.map(b => b.id === bookId ? { ...b, color } : b));
  };

  const deleteBook = (bookId: string) => {
    if(confirm("Remover este livro?")) {
      save(books.filter(b => b.id !== bookId));
      setSelectedBookId(null);
    }
  };

  const toggleComplete = (bookId: string) => {
    save(books.map(b => b.id === bookId ? { ...b, completed: !b.completed } : b));
  };

  const addCategory = () => {
    if(!newCatName.trim()) return;
    const newCat: LibraryCategory = {
      id: crypto.randomUUID(),
      name: newCatName,
      icon: newCatIcon,
      color: "var(--book-color-1)"
    };
    const newCats = [...categories, newCat];
    save(books, newCats);
    setNewCatName("");
    setShowIconMenu(false);
    setActiveTab(newCat.id);
  };

  const deleteCategory = (catId: string) => {
    if(categories.length <= 1) return alert("Mínimo 1 estante.");
    if(confirm("Apagar estante e livros?")) {
      const newCats = categories.filter(c => c.id !== catId);
      const newBooks = books.filter(b => b.categoryId !== catId);
      save(newBooks, newCats);
      setActiveTab(newCats[0].id);
    }
  };

  const activeBooks = books.filter(b => b.categoryId === activeTab);
  const currentBook = books.find(b => b.id === selectedBookId);
  const activeCategoryData = categories.find(c => c.id === activeTab);
  const shelf1 = activeBooks.filter((_, i) => i % 2 === 0);
  const shelf2 = activeBooks.filter((_, i) => i % 2 !== 0);

  const woods = [
    { name: "Carvalho", color: "#a16207" }, // Amber-700
    { name: "Mogno", color: "#7f1d1d" },    // Red-900
    { name: "Bétula", color: "#d4a373" },   // Custom Beige
    { name: "Ébano", color: "#3f3f46" },    // Zinc-700
  ];

  return (
    <div 
      className="box-padrao flex flex-col p-0 overflow-hidden relative transition-colors duration-500 select-none"
      onClick={() => {
        if(selectedBookId) setSelectedBookId(null);
        if(isAddingBook) setIsAddingBook(false);
        if(isManagingCats) setIsManagingCats(false);
        if(showIconMenu) setShowIconMenu(false);
      }}
    >
      
      {/* --- HEADER --- */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar items-center z-30 h-12 shrink-0 px-2 bg-current/5 backdrop-blur-sm">
        {categories.map(cat => {
          const Icon = iconMap[cat.icon] || Book;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(cat.id); setSelectedBookId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-current/10 text-primary shadow-sm" 
                  : "bg-transparent opacity-60 hover:opacity-100 hover:bg-current/5"
              }`}
            >
              <Icon size={14} /> {cat.name}
            </button>
          );
        })}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsManagingCats(!isManagingCats); }}
          className="ml-auto p-1.5 opacity-60 hover:opacity-100 hover:text-primary rounded-full hover:bg-current/10 transition shrink-0"
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* --- MODAL ESTANTES --- */}
      {isManagingCats && (
        <div className="absolute top-12 left-0 right-0 bg-background/95 p-3 z-40 animate-in slide-in-from-top-2 shadow-lg backdrop-blur-md" onClick={e => e.stopPropagation()}>
          <h3 className="text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Nova Estante</h3>
          <div className="flex gap-2 mb-3 items-start">
            <div className="relative">
               <button onClick={(e) => { e.stopPropagation(); setShowIconMenu(!showIconMenu); }} className="w-9 h-9 flex items-center justify-center bg-black/5 rounded-lg hover:bg-black/10 transition">
                 {(() => { const I = iconMap[newCatIcon] || Book; return <I size={18}/> })()}
               </button>
               {showIconMenu && (
                 <div className="absolute top-10 left-0 bg-popover shadow-xl rounded-xl p-2 grid grid-cols-4 gap-1 z-50 w-48 animate-in zoom-in-95">
                   {Object.keys(iconMap).map(k => {
                     const I = iconMap[k];
                     return <button key={k} onClick={() => { setNewCatIcon(k); setShowIconMenu(false); }} className={`p-2 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary ${newCatIcon === k ? 'bg-primary/10 text-primary' : ''}`}><I size={16} /></button>
                   })}
                 </div>
               )}
            </div>
            <input className="flex-1 bg-black/5 rounded-lg px-2 h-9 text-sm outline-none focus:ring-1 focus:ring-primary text-inherit" placeholder="Nome (ex: Mangás)" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
            <button onClick={addCategory} className="bg-primary text-primary-foreground px-3 h-9 rounded-lg text-xs font-bold hover:opacity-90">CRIAR</button>
          </div>

          <h3 className="text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Acabamento</h3>
          <div className="flex gap-2 mb-4">
            {woods.map(w => (
              <button key={w.name} onClick={() => save(books, categories, { ...settings, woodColor: w.color })} className={cn("w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition shadow-sm relative overflow-hidden", settings.woodColor === w.color && "ring-primary")} style={{ backgroundColor: w.color }} title={w.name}>
                 {/* Efeito de textura na bolinha */}
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%,transparent_100%)] opacity-50 bg-[length:10px_10px]" />
              </button>
            ))}
          </div>
          <div className="max-h-24 overflow-y-auto pt-2 custom-scrollbar">
             {categories.map(c => (
               <div key={c.id} className="flex justify-between items-center text-xs py-1 px-1 hover:bg-current/5 rounded">
                 <span className="opacity-80 flex items-center gap-2">{(() => { const I = iconMap[c.icon] || Book; return <I size={12} className="opacity-50"/> })()}{c.name}</span>
                 <button onClick={() => deleteCategory(c.id)} className="text-red-500 opacity-60 hover:opacity-100"><Trash2 size={12}/></button>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* --- ESTANTE REDESENHADA --- */}
      <div className="flex-1 relative p-4 flex flex-col justify-end gap-6 overflow-hidden">
        {[shelf1, shelf2].map((shelf, idx) => (
          <div key={idx} className="relative w-full h-32 flex items-end group/shelf">
             
             {/* Fundo do Nicho (Parede interna escura para dar profundidade) */}
             <div className="absolute inset-x-2 top-2 bottom-3 bg-black/20 shadow-inner rounded-t-lg backdrop-blur-sm transition-colors duration-500"></div>
             
             {/* Livros */}
             <div className="relative z-10 w-full px-6 flex items-end gap-[2px] overflow-x-auto no-scrollbar h-full pb-3.5 perspective-[500px]">
                {shelf.map(book => <BookItem key={book.id} book={book} selected={selectedBookId === book.id} onClick={(e) => {e.stopPropagation(); setSelectedBookId(book.id)}} />)}
                {shelf.length === 0 && idx === 0 && <span className="text-[10px] opacity-30 w-full text-center pb-6">Estante vazia...</span>}
             </div>

             {/* Prateleira de Madeira (Frontal) */}
             <div 
               className="absolute bottom-0 left-0 right-0 h-4 shadow-lg z-20 rounded-sm flex items-center justify-center overflow-hidden" 
               style={{ backgroundColor: settings.woodColor }}
             >
                {/* Textura de Madeira via CSS */}
                <div className="absolute inset-0 w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_12px)] pointer-events-none"></div>
                {/* Brilho Superior */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                {/* Sombra Inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/30"></div>
             </div>

             {/* Laterais da Estante (Suportes) */}
             <div className="absolute bottom-0 left-0 w-2 h-[110%] rounded-t-sm z-30 shadow-md" style={{ backgroundColor: settings.woodColor, filter: 'brightness(0.8)' }}></div>
             <div className="absolute bottom-0 right-0 w-2 h-[110%] rounded-t-sm z-30 shadow-md" style={{ backgroundColor: settings.woodColor, filter: 'brightness(0.8)' }}></div>
          </div>
        ))}
        
        <button onClick={(e) => { e.stopPropagation(); setIsAddingBook(true); setIsManagingCats(false); }} className="absolute bottom-4 right-4 z-40 bg-primary hover:opacity-90 text-primary-foreground p-3 rounded-full shadow-lg transition transform hover:scale-110 active:scale-95"><Plus size={20} /></button>
      </div>

      {/* --- ADD BOOK MODAL --- */}
      {isAddingBook && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md p-4 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.2)] z-50 animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
          <h3 className="text-xs font-bold opacity-60 mb-2">Adicionar em: <span className="text-primary">{activeCategoryData?.name}</span></h3>
          <div className="flex gap-2 mb-2 items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm cursor-pointer hover:scale-110 transition">
              <input type="color" className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" value={newBookColor} onChange={e => setNewBookColor(e.target.value)} title="Cor da capa" />
            </div>
            
            <input autoFocus className="flex-1 bg-black/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-inherit" placeholder="Título..." value={newBookTitle} onChange={e => setNewBookTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBook()} />
            <button onClick={addBook} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-xs">OK</button>
          </div>
          <input className="w-full bg-transparent text-xs py-1 opacity-70 outline-none text-inherit" placeholder="Link (http://...) - Opcional" value={newBookLink} onChange={e => setNewBookLink(e.target.value)} />
        </div>
      )}

      {/* --- DETAILS CARD --- */}
      {selectedBookId && currentBook && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setSelectedBookId(null)}>
          <div className="bg-background w-full max-w-xs rounded-2xl p-4 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden text-foreground" onClick={e => e.stopPropagation()}>
            
            <div className="relative w-20 h-28 mx-auto mb-3 shadow-lg rounded-sm cursor-pointer group/cover transition-transform hover:scale-105" style={{ backgroundColor: currentBook.color }}>
               <input 
                 type="color" 
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                 value={currentBook.color}
                 onChange={(e) => updateBookColor(currentBook.id, e.target.value)}
                 title="Clique para mudar a cor"
               />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 bg-black/20 text-white text-[10px] font-bold pointer-events-none">
                 <Palette size={16} />
               </div>
               <div className="absolute left-1 top-0 bottom-0 w-[2px] bg-white/20 pointer-events-none"></div>
            </div>

            <h3 className="text-center font-bold text-lg leading-tight mb-1">{currentBook.title}</h3>
            <p className="text-center text-xs opacity-60 uppercase tracking-widest mb-4">{activeCategoryData?.name}</p>
            
            <div className="flex flex-col gap-2">
              <button onClick={() => { toggleComplete(currentBook.id); setSelectedBookId(null); }} className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${currentBook.completed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-black/5 hover:bg-black/10'}`}>
                <Check size={16} /> {currentBook.completed ? "Lido (Desmarcar)" : "Marcar como Lido"}
              </button>
              {currentBook.link && (
                <a href={currentBook.link} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition">
                  <ExternalLink size={16} /> Abrir Material
                </a>
              )}
              <button onClick={() => deleteBook(currentBook.id)} className="text-red-500 hover:text-red-600 text-xs mt-2 flex items-center justify-center gap-1">
                <Trash2 size={12} /> Remover da estante
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BookItem({ book, selected, onClick }: { book: LibraryBook, selected: boolean, onClick: (e: any) => void }) {
  return (
    <div onClick={onClick} className={`group relative flex flex-col items-center justify-end cursor-pointer transition-transform duration-200 origin-bottom ${selected ? 'scale-110 z-20 -translate-y-4' : 'hover:-translate-y-1 hover:z-10'}`} style={{ width: '28px', flexShrink: 0 }}>
      {/* Marcador de Lido (Fita) */}
      {book.completed && (
        <div className="absolute -top-1 right-1 w-2 h-4 bg-green-500 z-10 shadow-sm animate-in slide-in-from-top-2">
           <div className="absolute bottom-0 left-0 right-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-green-500 border-r-green-500 border-b-transparent"></div>
        </div>
      )}
      
      <div className="w-full rounded-[2px] border-r border-white/10 shadow-md relative overflow-hidden" style={{ height: `${book.height * 1.8}px`, backgroundColor: book.color }}>
        {/* Lombada com textura sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 pointer-events-none"></div>
        
        {/* Padrões da lombada */}
        {book.pattern === 0 && <div className="w-full h-full flex flex-col justify-between py-2 px-0.5"><div className="w-full h-[1px] bg-black/30"></div><div className="w-full h-[1px] bg-black/30"></div></div>}
        {book.pattern === 1 && <div className="absolute top-4 bottom-4 left-1 right-1 bg-black/10 rounded-sm border border-black/10"></div>}
        {book.pattern === 2 && <div className="absolute top-2 w-full text-center"><div className="w-2 h-2 bg-white/30 rounded-full mx-auto shadow-inner"></div></div>}
        
        {/* Vinco Lateral */}
        <div className="absolute left-0.5 top-0 bottom-0 w-[1px] bg-white/20"></div>
      </div>
    </div>
  );
}