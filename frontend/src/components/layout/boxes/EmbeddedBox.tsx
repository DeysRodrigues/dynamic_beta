import { useState, useEffect, useRef } from "react";
import { 
  RefreshCw, Settings2, MonitorPlay, Smartphone, Lock, Unlock
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";

interface EmbeddedBoxProps {
  id?: string;
}

export default function EmbeddedBox({ id = "embedded-default" }: EmbeddedBoxProps) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const savedState = getBoxContent(id);

  // Estados
  const [inputUrl, setInputUrl] = useState<string>(
    savedState.url || "https://youtu.be/9kzE8isXlQY?si=AQVX6yVFqDXfRZMc"
  );
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [mode, setMode] = useState<'video' | 'app'>(savedState.mode || 'video');
  const [isLocked, setIsLocked] = useState<boolean>(savedState.isLocked || false);
  
  const [showControls, setShowControls] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // --- LISTA ---
  const quickLinks = [
    { name: "YouTube", url: "https://www.youtube.com/embed/jfKfPfyJRdk", type: 'video' },
    { name: "Hidratação", url: "/w/water", type: 'app' },
  ];

  useEffect(() => {
    if (inputUrl.includes("/w/") && mode !== 'app') {
      setMode('app');
    }
    setEmbedUrl(convertToEmbed(inputUrl));
    
    setBoxContent(id, { url: inputUrl, mode, isLocked });
  }, [inputUrl, id, mode, isLocked, setBoxContent]);

  const convertToEmbed = (url: string): string => {
    try {
      if (!url) return "";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
        else if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0];
        if (url.includes("/embed/")) return url;
        return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const toggleMode = () => {
    const newMode = mode === 'video' ? 'app' : 'video';
    setMode(newMode);
  };

  return (
    <div 
      className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 group border flex flex-col backdrop-blur-md ${
        mode === 'video' ? 'border-transparent' : 'border-white/10'
      }`}
      // APLICA O TEMA (Se for vídeo, fica preto sólido para melhor contraste. Se for App, segue o tema transparente, isso é so pra boa user exp)
      style={{
        backgroundColor: mode === 'video' 
          ? '#000000' 
          : 'color-mix(in srgb, var(--box-color, #ffffff) calc(var(--box-opacity, 1) * 100%), transparent)',
        color: 'var(--box-text-color)'
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      
      {/* --- IFRAME (Conteúdo Principal) --- */}
      <div className="flex-1 relative z-0 w-full h-full">
        {embedUrl ? (
          <iframe
            key={refreshKey}
            ref={iframeRef}
            src={embedUrl}
            className={`w-full h-full transition-opacity duration-500 ${mode === 'video' ? 'opacity-100' : 'opacity-100'}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; geolocation"
            allowFullScreen
            title={`Embed-${id}`}
            style={{ borderRadius: '0 0 1rem 1rem' }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center opacity-50">
            <MonitorPlay size={40} />
            <p className="text-sm font-medium">Cole um link ou escolha um widget</p>
          </div>
        )}
      </div>

      {/* --- BOTÃO DE DESTRANCAR --- */}
      {isLocked && (
         <button
            onClick={() => setIsLocked(false)}
            className="absolute top-3 right-3 p-2 rounded-full z-50 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm bg-black/20 text-white backdrop-blur-sm hover:bg-black/40"
            title="Destrancar Controles"
         >
            <Lock size={16} />
         </button>
      )}

      {/* --- OVERLAY DE CONTROLES --- */}
      {!isLocked && (
        <>
          {/* Botão Mobile (Engrenagem) */}
          <button 
            className={`md:hidden absolute top-2 right-2 p-2 rounded-full z-30 transition-all shadow-sm ${
               showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
            } bg-black/20 text-white backdrop-blur-sm`}
            onClick={() => setShowControls(true)}
          >
            <Settings2 size={16} />
          </button>

          {/* Menu Principal */}
          <div 
            className={`absolute top-0 left-0 right-0 p-3 transition-all duration-300 z-40 bg-gradient-to-b ${
              mode === 'video' 
                ? 'from-black/90 via-black/60 to-transparent text-white' 
                : 'from-black/40 via-black/20 to-transparent text-white' // Texto branco no menu para contraste
            } ${showControls || !embedUrl ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
          >
            <div className="flex flex-col gap-2 max-w-full">
              
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg backdrop-blur-md border border-white/10 bg-white/10 shrink-0">
                  <Settings2 size={18} />
                </div>
                
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="URL..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg outline-none transition-colors backdrop-blur-sm border border-white/10 bg-white/10 text-white placeholder-white/50 focus:bg-white/20"
                />

                <button onClick={() => setIsLocked(true)} className="p-2 rounded-lg transition-colors border border-white/10 bg-white/10 hover:bg-white/20 text-white shrink-0" title="Bloquear Menu">
                  <Unlock size={18} />
                </button>

                <button onClick={toggleMode} className="p-2 rounded-lg transition-colors border border-white/10 bg-white/10 hover:bg-white/20 text-white shrink-0" title={mode === 'video' ? "Modo Widget" : "Modo Vídeo"}>
                  {mode === 'video' ? <Smartphone size={18} /> : <MonitorPlay size={18} />}
                </button>

                <button onClick={handleRefresh} className="p-2 rounded-lg transition-colors border border-white/10 bg-white/10 hover:bg-white/20 text-white shrink-0" title="Recarregar">
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Tags Rápidas */}
              <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {quickLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      setInputUrl(link.url);
                      setMode(link.type as 'video' | 'app');
                    }}
                    className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-white/10 bg-white/10 hover:bg-white/20 text-white shadow-sm"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}