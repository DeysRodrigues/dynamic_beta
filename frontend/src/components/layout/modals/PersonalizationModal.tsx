import { themeThumbnail } from "@/lib/themeImages";
import { X, Check, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { useThemeStore, getWallpaperStyle, type WallpaperType } from "@/store/useThemeStore";
import { useRef } from "react";

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalizationModal({ isOpen, onClose }: PersonalizationModalProps) {
  const { wallpaper, setWallpaper, customImage, setCustomImage } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const options: { id: WallpaperType; label: string }[] = [
    { id: "plain", label: "Clean" },
    { id: "dots", label: "Pontos" },
    { id: "grid", label: "Grid" },
    { id: "pixel-art", label: "Pixel" },
    { id: "blueprint", label: "Blueprint" },
    { id: "clouds", label: "Nuvens" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative flex flex-col gap-6" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="text-indigo-600"/> Personalizar Fundo
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
        </div>

        {/* --- UPLOAD AREA --- */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Imagem Personalizada</label>
          
          <div className="flex gap-4">
            {/* Upload button */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-32 rounded-xl bg-indigo-50/70 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 transition group"
            >
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition">
                <Upload size={20} />
              </div>
              <p className="text-xs text-indigo-600 font-bold">Enviar Imagem</p>
              <span className="text-[10px] text-gray-400">JPG, PNG ou GIF</span>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>

            {/* Preview of the current image (if any) */}
            {customImage && (
              <div 
                className={`relative flex-1 h-32 rounded-xl overflow-hidden cursor-pointer transition ${
                  wallpaper === 'custom' ? "ring-2 ring-indigo-500" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setWallpaper('custom')}
              >
                <img src={themeThumbnail(customImage) ?? undefined} alt="Wallpaper" decoding="async" className="w-full h-full object-cover" />
                
                {/* Indicador de Selecionado */}
                {wallpaper === 'custom' && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                    <Check size={12} />
                  </div>
                )}
                
                {/* Clear button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setWallpaper('plain');
                
                  }}
                  className="absolute bottom-2 right-2 p-1.5 bg-white/80 text-red-500 rounded-lg hover:bg-white shadow-sm"
                  title="Remover"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            )}
          </div>
        </div>


        {/* --- CSS PATTERNS --- */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Padrões Leves</h3>
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setWallpaper(opt.id)}
                className={`relative h-20 rounded-xl transition-all overflow-hidden ${
                  wallpaper === opt.id ? "ring-2 ring-indigo-500 scale-[1.02]" : "opacity-80 hover:opacity-100"
                }`}
              >
                <div className="absolute inset-0" style={getWallpaperStyle(opt.id, null)} />
                <div className="absolute inset-x-0 bottom-0 bg-white/90 p-1 text-[10px] font-bold text-center text-gray-700 backdrop-blur-sm">
                  {opt.label}
                </div>
                {wallpaper === opt.id && (
                  <div className="absolute top-1 right-1 bg-indigo-600 text-white p-0.5 rounded-full shadow-sm">
                    <Check size={10} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}