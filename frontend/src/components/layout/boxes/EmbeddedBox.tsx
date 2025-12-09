import { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Settings2,
  MonitorPlay,
  Smartphone,
  Lock,
  Unlock,
  Plus,
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";

// Tipo para os atalhos salvos
interface Preset {
  url: string;
  mode: "video" | "app";
  label: string;
}

interface EmbeddedBoxProps {
  id?: string;
}

export default function EmbeddedBox({
  id = "embedded-default",
}: EmbeddedBoxProps) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const savedState = getBoxContent(id);

  // 1. Inicia VAZIO para não pesar no carregamento
  const [inputUrl, setInputUrl] = useState<string>(savedState.url || "");
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [mode, setMode] = useState<"video" | "app">(savedState.mode || "video");
  const [isLocked, setIsLocked] = useState<boolean>(
    savedState.isLocked || false
  );

  // 2. Estado para os 3 Slots (Presets)
  const [presets, setPresets] = useState<(Preset | null)[]>(
    savedState.presets || [null, null, null]
  );

  const [showControls, setShowControls] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Detecta modo app automaticamente se for widget interno
    if (inputUrl.includes("/w/") && mode !== "app") {
      setMode("app");
    }

    // Só converte se tiver URL
    setEmbedUrl(inputUrl ? convertToEmbed(inputUrl) : "");

    // Salva URL, Modo e os PRESETS
    setBoxContent(id, { url: inputUrl, mode, isLocked, presets });
  }, [inputUrl, id, mode, isLocked, presets, setBoxContent]);

  const convertToEmbed = (url: string): string => {
    try {
      if (!url) return "";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("youtu.be/"))
          videoId = url.split("youtu.be/")[1]?.split("?")[0];
        else if (url.includes("v="))
          videoId = url.split("v=")[1]?.split("&")[0];
        if (url.includes("/embed/")) return url;
        return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const toggleMode = () => {
    const newMode = mode === "video" ? "app" : "video";
    setMode(newMode);
  };

  // --- LÓGICA DOS SLOTS ---
  const handleSlotClick = (index: number) => {
    const slot = presets[index];
    if (slot) {
      // CARREGAR
      setInputUrl(slot.url);
      setMode(slot.mode);
    } else {
      // SALVAR
      if (!inputUrl) return alert("Cole uma URL primeiro para salvar.");
      const label = prompt("Nome do atalho (ex: Youtube):");
      if (!label) return;

      const newPresets = [...presets];
      newPresets[index] = { url: inputUrl, mode, label: label.slice(0, 10) }; // Limita texto
      setPresets(newPresets);
    }
  };

  const clearSlot = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); // Previne menu nativo
    if (confirm("Limpar este atalho?")) {
      const newPresets = [...presets];
      newPresets[index] = null;
      setPresets(newPresets);
    }
  };

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 group border flex flex-col backdrop-blur-md ${
        mode === "video" ? "border-transparent" : "border-white/10"
      }`}
      style={{
        backgroundColor:
          mode === "video"
            ? "#000000"
            : "color-mix(in srgb, var(--box-color, #ffffff) calc(var(--box-opacity, 1) * 100%), transparent)",
        color: "var(--box-text-color)",
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* --- IFRAME (Só renderiza se tiver URL) --- */}
      <div className="flex-1 relative z-0 w-full h-full">
        {embedUrl ? (
          <iframe
            key={refreshKey}
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={`Embed-${id}`}
            style={{ borderRadius: "0 0 1rem 1rem" }}
          />
        ) : (
          /* Placeholder leve quando vazio */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center opacity-30 select-none">
            <MonitorPlay size={40} />
            <p className="text-sm font-medium">Cole um link ou use um slot</p>
          </div>
        )}
      </div>

      {/* --- BOTÃO DE DESBLOQUEAR --- */}
      {isLocked && (
        <button
          onClick={() => setIsLocked(false)}
          className="absolute top-3 right-3 p-2 rounded-full z-50 opacity-0 group-hover:opacity-100 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
          title="Destrancar Controles"
        >
          <Lock size={16} />
        </button>
      )}

      {/* --- CONTROLES --- */}
      {!isLocked && (
        <>
          {/* Mobile Toggle */}
          <button
            className={`md:hidden absolute top-2 right-2 p-2 rounded-full z-30 shadow-sm ${
              showControls ? "opacity-0 pointer-events-none" : "opacity-100"
            } bg-black/20 text-white backdrop-blur-sm`}
            onClick={() => setShowControls(true)}
          >
            <Settings2 size={16} />
          </button>

          {/* Menu Deslizante */}
          <div
            className={`absolute top-0 left-0 right-0 p-3 transition-all duration-300 z-40 bg-gradient-to-b ${
              mode === "video"
                ? "from-black/90 via-black/60 to-transparent text-white"
                : "from-black/40 via-black/20 to-transparent text-white"
            } ${
              showControls || !embedUrl
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex flex-col gap-2 max-w-full">
              {/* Barra de Input */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg backdrop-blur-md border border-white/10 bg-white/10 shrink-0">
                  <Settings2 size={18} />
                </div>

                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="URL..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg outline-none backdrop-blur-sm border border-white/10 bg-white/10 text-white placeholder-white/50 focus:bg-white/20"
                />

                <button
                  onClick={() => setIsLocked(true)}
                  className="p-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 text-white"
                  title="Bloquear Menu"
                >
                  <Unlock size={18} />
                </button>

                <button
                  onClick={toggleMode}
                  className="p-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 text-white"
                >
                  {mode === "video" ? (
                    <Smartphone size={18} />
                  ) : (
                    <MonitorPlay size={18} />
                  )}
                </button>

                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 text-white"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* 3 SLOTS DE LINKS */}
              <div className="flex gap-2 justify-between">
                {[0, 1, 2].map((i) => {
                  const slot = presets[i];
                  return (
                    <button
                      key={i}
                      onClick={() => handleSlotClick(i)}
                      onContextMenu={(e) => clearSlot(e, i)}
                      className={`
                        flex-1 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-all border
                        ${
                          slot
                            ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30 border-dashed"
                        }
                      `}
                      title={slot ? slot.label : "Vazio - Clique para Salvar"}
                    >
                      {slot ? (
                        <span className="truncate max-w-[60px]">
                          {slot.label}
                        </span>
                      ) : (
                        <Plus size={14} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
