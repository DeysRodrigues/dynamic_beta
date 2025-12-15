import { useState, useMemo } from "react";
import { 
  BookOpen, Plus, Settings2, Library, 
  ArrowRight, Trash2 
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useDashboardStore } from "@/store/useDashboardStore";

interface BookItem { 
  id: string; 
  title: string; 
  current: number; 
  total: number; 
  color: string; 
}

interface TrackerSettings {
  pageStep: number;
}

export default function BookTrackerBox({ id = "books-default" }: { id?: string }) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const { boxes } = useDashboardStore();
  const saved = getBoxContent(id);
  
  const [books, setBooks] = useState<BookItem[]>(saved.books || []);
  const [settings, setSettings] = useState<TrackerSettings>(saved.settings || { pageStep: 10 });
  
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [newBook, setNewBook] = useState({ title: "", total: "" });

  const colors = ["bg-emerald-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500", "bg-rose-500"];

  const save = (data: BookItem[], cfg?: TrackerSettings) => {
    const newSettings = cfg || settings;
    setBooks(data);
    setSettings(newSettings);
    setBoxContent(id, { books: data, settings: newSettings });
  };

  const addBook = () => {
    if (!newBook.title || !newBook.total) return;
    const item: BookItem = {
      id: crypto.randomUUID(),
      title: newBook.title,
      current: 0,
      total: Number(newBook.total),
      color: colors[books.length % colors.length]
    };
    save([...books, item]);
    setIsAdding(false);
    setNewBook({ title: "", total: "" });
  };

  const deleteBook = (bookId: string) => {
    if(confirm("Parar de rastrear este livro?")) {
      save(books.filter(b => b.id !== bookId));
    }
  };

  const updateProgress = (bookId: string, delta: number) => {
    const updated = books.map(b => {
      if (b.id === bookId) {
        const newPage = Math.min(Math.max(0, b.current + delta), b.total);
        return { ...b, current: newPage };
      }
      return b;
    });
    save(updated);
  };

  const availableImports = useMemo(() => {
    const libraryIds = boxes.filter(boxId => boxId.startsWith("library"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allBooksFromLibraries: any[] = [];
    libraryIds.forEach(libId => {
      const content = getBoxContent(libId);
      if (content && content.books) {
        allBooksFromLibraries = [...allBooksFromLibraries, ...content.books];
      }
    });
    const trackedTitles = books.map(b => b.title.toLowerCase().trim());
    return allBooksFromLibraries.filter(b => !trackedTitles.includes(b.title.toLowerCase().trim()));
  }, [boxes, books, getBoxContent]);

  const handleImport = (title: string) => {
    setNewBook({ title, total: "" });
    setIsImporting(false);
    setIsAdding(true);
  };

  return (
    <div className="box-padrao p-0 flex flex-col relative overflow-hidden">
      
      {/* HEADER */}
      <div className="p-3 flex justify-between items-center bg-current/5">
        <h2 className="font-bold flex items-center gap-2 text-sm">
          <BookOpen size={16} className="text-primary"/> Leitura
        </h2>
        <div className="flex gap-1">
          <button onClick={() => { setShowSettings(!showSettings); setIsAdding(false); setIsImporting(false); }} className={`p-1.5 rounded-md transition ${showSettings ? "bg-primary/10 text-primary" : "hover:bg-current/10 opacity-70 hover:opacity-100"}`}><Settings2 size={16} /></button>
          <button onClick={() => { setIsImporting(!isImporting); setIsAdding(false); setShowSettings(false); }} className={`p-1.5 rounded-md transition ${isImporting ? "bg-primary/10 text-primary" : "hover:bg-current/10 opacity-70 hover:opacity-100"}`}><Library size={16} /></button>
          <button onClick={() => { setIsAdding(!isAdding); setIsImporting(false); setShowSettings(false); }} className={`p-1.5 rounded-md transition ${isAdding ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-primary"}`}><Plus size={16} /></button>
        </div>
      </div>

      {/* --- MODAL CONFIGURAÇÕES --- */}
      {showSettings && (
        <div className="p-3 bg-current/5 animate-in slide-in-from-top-2">
          <label className="text-xs font-bold opacity-60 uppercase mb-2 block">Passo de Leitura</label>
          <div className="flex gap-2">
            {[5, 10, 20, 50].map(step => (
              <button
                key={step}
                onClick={() => save(books, { ...settings, pageStep: step })}
                className={`flex-1 py-1 text-xs font-bold rounded ${
                  settings.pageStep === step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-transparent hover:bg-current/10"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL IMPORTAÇÃO --- */}
      {isImporting && (
        <div className="p-3 bg-current/5 animate-in slide-in-from-top-2 max-h-40 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold opacity-60 uppercase mb-2">Disponíveis na Estante</h3>
          {availableImports.length === 0 ? (
            <p className="text-xs opacity-50 italic">Nenhum livro novo encontrado.</p>
          ) : (
            <div className="space-y-1">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {availableImports.map((b: any) => (
                <button 
                  key={b.id} 
                  onClick={() => handleImport(b.title)}
                  className="w-full text-left text-xs p-2 bg-current/5 rounded-lg hover:bg-primary/10 hover:text-primary flex justify-between items-center group transition"
                >
                  <span className="truncate font-medium">{b.title}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/50"/>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- MODAL ADICIONAR --- */}
      {isAdding && (
        <div className="p-3 bg-current/5 animate-in slide-in-from-top-2">
          <input 
            placeholder="Nome do Livro" 
            className="w-full text-sm p-2 mb-2 bg-black/5 rounded focus:ring-1 focus:ring-primary text-inherit" 
            value={newBook.title} 
            onChange={e => setNewBook({...newBook, title: e.target.value})} 
            autoFocus
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Págs" 
              className="w-20 text-sm p-2 bg-black/5 rounded focus:ring-1 focus:ring-primary text-inherit" 
              value={newBook.total} 
              onChange={e => setNewBook({...newBook, total: e.target.value})} 
              onKeyDown={e => e.key === 'Enter' && addBook()}
            />
            <button onClick={addBook} className="flex-1 bg-primary text-primary-foreground rounded text-xs font-bold hover:opacity-90 transition">
              INICIAR
            </button>
          </div>
        </div>
      )}

      {/* --- LISTA DE LIVROS --- */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {books.length === 0 && !isAdding && !isImporting && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 gap-2 min-h-[100px]">
            <BookOpen size={32}/>
            <p className="text-xs">Nenhum livro rastreado.</p>
          </div>
        )}

        {books.map(book => {
          const progress = Math.round((book.current / book.total) * 100);
          return (
            <div key={book.id} className="p-3 rounded-xl bg-current/5 hover:bg-current/10 transition-all group">
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold leading-tight truncate w-32 sm:w-48" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-[10px] opacity-60 font-medium mt-0.5">
                    {book.current} de {book.total} págs ({progress}%)
                  </p>
                </div>
                <button 
                  onClick={() => deleteBook(book.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${book.color}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>

              {/* Controles */}
              <div className="flex items-center justify-between gap-2">
                <button 
                  onClick={() => updateProgress(book.id, -settings.pageStep)} 
                  className="px-2 py-1 bg-current/5 hover:bg-current/10 rounded text-xs font-medium transition disabled:opacity-30"
                  disabled={book.current <= 0}
                >
                  -{settings.pageStep}
                </button>
                
                <span className="text-xs font-mono opacity-70">
                  Pg. {book.current}
                </span>

                <button 
                  onClick={() => updateProgress(book.id, settings.pageStep)} 
                  className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs font-bold transition disabled:opacity-30"
                  disabled={book.current >= book.total}
                >
                  +{settings.pageStep}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}