import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { getTodayDate } from "@/utils/DateUtils";
import { Sun, Cloud } from "lucide-react";

export default function PixelGardenBox() {
  const { tasks } = useTaskStore();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const today = getTodayDate();
    const completedToday = tasks.filter(t => t.date === today && t.completed).length;
    
    // Regra de Evolução:
    // 0 tasks = Terra
    // 1-2 tasks = Broto
    // 3-4 tasks = Planta Jovem
    // 5-7 tasks = Arbusto
    // 8+ tasks = Árvore Mestra
    if (completedToday === 0) setStage(0);
    else if (completedToday < 3) setStage(1);
    else if (completedToday < 5) setStage(2);
    else if (completedToday < 8) setStage(3);
    else setStage(4);
  }, [tasks]);

  const messages = [
    "O solo espera...",
    "Uma vida nasce!",
    "Crescendo forte...",
    "Quase lá!",
    "Jardim Lendário!"
  ];

  // --- DESENHOS PIXEL ART (SVG PURO) ---
  // Desenhamos quadrados (pixels) usando <rect>
  const PixelPlant = ({ level }: { level: number }) => {
    const C = {
      pote: "var(--pixel-pot)",    // Cor do Vaso
      poteSombra: "var(--pixel-pot-shadow)",
      terra: "var(--pixel-soil)",   // Cor da Terra
      verdeClaro: "var(--pixel-green-light)",
      verde: "var(--pixel-green)",
      verdeEscuro: "var(--pixel-green-dark)",
      tronco: "var(--pixel-trunk)",
      flor: "var(--pixel-flower)",
      miolo: "var(--pixel-flower-center)"
    };

    return (
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-xl" shapeRendering="crispEdges">
        
        {/* VASO (Sempre visível) */}
        <rect x="4" y="12" width="8" height="4" fill={C.pote} />
        <rect x="3" y="11" width="10" height="2" fill={C.poteSombra} />
        
        {/* NÍVEL 0: Só Terra */}
        {level === 0 && (
          <rect x="5" y="11" width="6" height="1" fill={C.terra} />
        )}

        {/* NÍVEL 1: Broto */}
        {level === 1 && (
          <g className="animate-bounce-slow">
            <rect x="7" y="10" width="2" height="2" fill={C.verdeClaro} />
            <rect x="7" y="12" width="2" height="1" fill={C.verdeEscuro} />
          </g>
        )}

        {/* NÍVEL 2: Planta Jovem */}
        {level === 2 && (
          <g className="origin-bottom animate-sway">
            <rect x="7" y="9" width="2" height="3" fill={C.verde} />
            <rect x="5" y="8" width="2" height="2" fill={C.verdeClaro} /> {/* Folha Esq */}
            <rect x="9" y="8" width="2" height="2" fill={C.verdeClaro} /> {/* Folha Dir */}
          </g>
        )}

        {/* NÍVEL 3: Arbusto */}
        {level === 3 && (
          <g>
            <rect x="7" y="8" width="2" height="4" fill={C.tronco} />
            <rect x="5" y="6" width="6" height="4" fill={C.verde} />
            <rect x="6" y="5" width="4" height="6" fill={C.verde} />
            <rect x="4" y="7" width="2" height="2" fill={C.verdeEscuro} />
            <rect x="10" y="7" width="2" height="2" fill={C.verdeEscuro} />
          </g>
        )}

        {/* NÍVEL 4: Árvore Mestra */}
        {level === 4 && (
          <g className="animate-pulse-slow">
            <rect x="7" y="7" width="2" height="5" fill={C.tronco} />
            
            {/* Copa */}
            <rect x="4" y="3" width="8" height="6" fill={C.verde} />
            <rect x="3" y="4" width="10" height="4" fill={C.verde} />
            <rect x="5" y="2" width="6" height="8" fill={C.verde} />
            
            {/* Sombra */}
            <rect x="5" y="8" width="6" height="1" fill={C.verdeEscuro} />

            {/* Flores */}
            <rect x="5" y="4" width="1" height="1" fill={C.flor} />
            <rect x="9" y="3" width="1" height="1" fill={C.flor} />
            <rect x="10" y="6" width="1" height="1" fill={C.flor} />
            <rect x="4" y="6" width="1" height="1" fill={C.flor} />
            <rect x="7" y="2" width="2" height="2" fill={C.flor} />
            
            {/* Miolos */}
            <rect x="5" y="4" width="1" height="1" fill={C.miolo} rx="0.5" className="animate-ping" style={{animationDuration: '3s'}} />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="box-padrao bg-gradient-to-b from-sky-200 to-indigo-50 border-indigo-100 relative overflow-hidden flex flex-col items-center justify-between p-4 group transition-all hover:shadow-md">
      
      {/* Elementos de Fundo (Decorativos) */}
      <div className="absolute top-3 right-3 text-yellow-400 animate-spin-slow opacity-90">
        <Sun size={24} />
      </div>
      <div className="absolute top-8 left-2 text-white animate-float opacity-80">
        <Cloud size={32} />
      </div>

      {/* Título Flutuante */}
      <div className="z-10 bg-background/70 backdrop-blur-md px-3 py-1 rounded-full border border-background/50 shadow-sm flex items-center gap-1">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pixel Garden</span>
      </div>

      {/* A PLANTA */}
      <div className="flex-1 w-full max-w-[160px] flex items-end justify-center z-10 pb-1 relative">
         {/* Tooltip de Nível */}
         <div className="absolute -top-6 bg-foreground/80 text-background text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Estágio {stage}/4
         </div>
         
         <div className={`w-full aspect-square transition-transform duration-500 hover:scale-110 cursor-pointer ${stage === 4 ? 'hover:rotate-2' : ''}`}>
            <PixelPlant level={stage} />
         </div>
      </div>

      {/* Barra de XP */}
      <div className="w-full space-y-1 z-10">
        <div className="flex justify-between text-[10px] text-primary font-bold px-1">
          <span>Nv. {stage}</span>
          <span>{messages[stage]}</span>
        </div>
        <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden border border-background/50">
          <div 
             className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_#4ade80]"
             style={{ width: `${Math.max(5, (stage / 4) * 100)}%` }}
          />
        </div>
      </div>

      {/* Animações CSS Customizadas (Injetadas aqui para garantir funcionamento) */}
      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}