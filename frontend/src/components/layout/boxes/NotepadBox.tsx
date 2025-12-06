import { useState, useEffect } from "react";
import { Save, FileText } from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";

interface NotepadBoxProps {
  id?: string;
}

export default function NotepadBox({ id = "notepad-default" }: NotepadBoxProps) {
  const { getBoxContent, setBoxContent } = useBoxContentStore();
  
  // Carrega texto salvo ou vazio
  const [text, setText] = useState<string>(getBoxContent(id).text || "");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Salva automaticamente 1 segundo após parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBoxContent(id, { text });
      if (text) setLastSaved(new Date().toLocaleTimeString().slice(0, 5));
    }, 1000);

    return () => clearTimeout(timer);
  }, [text, id, setBoxContent]);

  return (
    <div className="box-padrao flex flex-col h-full relative group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg">
                <FileText size={16} />
            </div>
            <h2 className="text-lg font-semibold">Notas</h2>
        </div>
        {lastSaved && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Save size={10} /> Salvo às {lastSaved}
          </span>
        )}
      </div>

      <textarea
        className="flex-1 w-full bg-yellow-50/50 border-none outline-none resize-none font-handwriting p-3 rounded-xl text-sm leading-relaxed custom-scrollbar focus:bg-yellow-50 focus:ring-2 focus:ring-yellow-200 transition-all"
        placeholder="Ideias, lembretes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
      />
    </div>
  );
}