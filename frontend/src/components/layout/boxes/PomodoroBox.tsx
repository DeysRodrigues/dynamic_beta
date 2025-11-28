import { CheckCircle, Coffee, Moon, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/storageKeys";

export default function PomodoroBox() {
  const TIMES = { work: 25 * 60, short: 1 * 5, long: 15 * 60 };

  const [time, setTime] = useState(TIMES.work);
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const [isRunning, setIsRunning] = useState(false);
  
  // Melhoria: Persistindo os contadores de sessões
  const [counts, setCounts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodoro-counts");
      return saved ? JSON.parse(saved) : { work: 0, short: 0, long: 0 };
    }
    return { work: 0, short: 0, long: 0 };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(time);
  const modeRef = useRef(mode); // Ref para acessar o modo atual dentro do intervalo sem bugs

  // Sincroniza refs com o estado
  useEffect(() => { timeLeftRef.current = time; }, [time]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Atualiza Título da Aba e Salva Contadores
  useEffect(() => {
    document.title = `${formatTime(time)} - ${mode === "work" ? "Foco" : "Pausa"}`;
    localStorage.setItem("pomodoro-counts", JSON.stringify(counts));
  }, [time, mode, counts]);

  // Carregar estado salvo do Timer ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POMODORO);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Atualiza ref e estado imediatamente para evitar inconsistência
        modeRef.current = parsed.mode; 
        setMode(parsed.mode);
        
        if (parsed.isRunning && parsed.startTime) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
          const remaining = parsed.duration - elapsed;
          
          if (remaining > 0) {
            setTime(remaining);
            setIsRunning(true);
            startTimer(); // Inicia o timer recuperado
          } else {
            setTime(0);
            setIsRunning(false);
            handleComplete(parsed.mode);
          }
        } else {
          setTime(parsed.duration);
        }
      } catch (e) {
        console.error("Erro ao carregar Pomodoro", e);
      }
    }
  }, []);

  const persistState = (running: boolean) => {
    localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify({
      mode: modeRef.current, // Usa ref para garantir o valor mais atual
      duration: timeLeftRef.current,
      isRunning: running,
      startTime: running ? Date.now() : null,
    }));
  };

  const startTimer = () => {
    if (timerRef.current) return;
    
    persistState(true);
    setIsRunning(true);
    
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTime(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        stopTimer();
        handleComplete(modeRef.current);
      }
    }, 1000);
  };

  const stopTimer = () => {
    // Essa função age como PAUSE
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
    persistState(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTime(TIMES[mode]);
    // Pequeno delay para garantir que o estado persistido atualize
    setTimeout(() => persistState(false), 0);
  };

  const handleComplete = (completedMode: "work" | "short" | "long") => {
    const labels = { work: "Foco", short: "Pausa Curta", long: "Pausa Longa" };
    
    // Toca som se permitido
    const audio = new Audio("/notify.mp3"); 
    audio.play().catch(() => {}); // Ignora erro se não tiver interação do usuário
    
    if (Notification.permission === "granted") {
      new Notification("Pomodoro", { body: `${labels[completedMode]} finalizado!` });
    } else {
      alert(`${labels[completedMode]} finalizado!`);
    }
    
    setCounts((prev: { [x: string]: number; }) => ({ ...prev, [completedMode]: prev[completedMode] + 1 }));
    
    // Lógica opcional: Alternar modo automaticamente
    if (completedMode === "work") changeMode("short");
    else changeMode("work");
  };

  const changeMode = (newMode: "work" | "short" | "long") => {
    stopTimer();
    setMode(newMode);
    setTime(TIMES[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="box-padrao flex flex-col items-center justify-between h-full">
      {/* Seletor de Modos */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-2 w-full justify-center">
        {(["work", "short", "long"] as const).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === m 
                ? "bg-white shadow-sm text-indigo-600 ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            {m === "work" ? "Foco" : m === "short" ? "Curta" : "Longa"}
          </button>
        ))}
      </div>

      {/* Timer Grande */}
      <div className="text-center my-4 relative">
        <span className="text-6xl font-bold text-gray-800 tracking-tight font-mono tabular-nums">
          {formatTime(time)}
        </span>
        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">
          {isRunning ? "Rodando" : "Pausado"}
        </p>
      </div>

      {/* Botões de Controle */}
      <div className="flex gap-3 mb-6 w-full px-4">
        <button
          onClick={() => isRunning ? stopTimer() : startTimer()}
          className={`flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isRunning 
              ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" 
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
          }`}
        >
          {isRunning ? (
            <><Pause size={20} fill="currentColor" /> PAUSAR</>
          ) : (
            <><Play size={20} fill="currentColor" /> INICIAR</>
          )}
        </button>
        
        <button 
          onClick={resetTimer} 
          className="p-3 text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-red-500 rounded-xl transition-all shadow-sm active:scale-95"
          title="Reiniciar Timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Contadores de Sessão */}
      <div className="flex gap-4 text-xs font-semibold bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
        <div className="flex items-center gap-1.5 text-emerald-600" title="Sessões de Foco">
          <CheckCircle size={14} /> {counts.work}
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center gap-1.5 text-amber-600" title="Pausas Curtas">
          <Coffee size={14} /> {counts.short}
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center gap-1.5 text-indigo-600" title="Pausas Longas">
          <Moon size={14} /> {counts.long}
        </div>
      </div>
    </div>
  );
}