import { CheckCircle, Coffee, Moon, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/storageKeys";

interface PomodoroCounts {
  work: number;
  short: number;
  long: number;
}

export default function PomodoroBox() {
  const TIMES = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };

  const [time, setTime] = useState(TIMES.work);
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const [isRunning, setIsRunning] = useState(false);
  
  // Estado para contagem de ciclos
  const [counts, setCounts] = useState<PomodoroCounts>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodoro-counts");
      return saved ? JSON.parse(saved) : { work: 0, short: 0, long: 0 };
    }
    return { work: 0, short: 0, long: 0 };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null); 
  const modeRef = useRef(mode); 

  // Mantém a ref atualizada para uso dentro do setInterval
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Salva contadores e título da aba
  useEffect(() => {
    const mins = Math.floor(time / 60);
    const secs = String(time % 60).padStart(2, "0");
    document.title = `${mins}:${secs} - ${mode === "work" ? "Foco" : "Pausa"}`;
    localStorage.setItem("pomodoro-counts", JSON.stringify(counts));
  }, [time, mode, counts]);

  // Limpeza ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const persistState = (running: boolean, targetEndTime: number | null) => {
    localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify({
      mode: modeRef.current,
      startTime: running ? Date.now() : null, 
      targetEndTime: targetEndTime,
      duration: time, 
      isRunning: running,
    }));
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
    endTimeRef.current = null;
    persistState(false, null);
  };

  const changeMode = (newMode: "work" | "short" | "long") => {
    stopTimer();
    setMode(newMode);
    setTime(TIMES[newMode]);
  };

  const handleComplete = (completedMode: "work" | "short" | "long") => {
    setCounts((prev) => ({ ...prev, [completedMode]: prev[completedMode] + 1 }));
    
    // Tocar som
    const audio = new Audio("/notify.mp3"); 
    audio.play().catch(() => {}); 
    
    if (Notification.permission === "granted") {
      new Notification("Pomodoro", { body: "Tempo esgotado!" });
    }
    
    // Troca automática de modo
    if (completedMode === "work") changeMode("short");
    else changeMode("work");
  };

  const startTimer = () => {
    if (timerRef.current) return;
    
    setIsRunning(true);
    
    // Define o tempo alvo (Agora + Segundos Restantes)
    const targetTime = Date.now() + (time * 1000);
    endTimeRef.current = targetTime;
    
    persistState(true, targetTime);

    timerRef.current = setInterval(() => {
      if (!endTimeRef.current) return;

      const now = Date.now();
      const diff = Math.ceil((endTimeRef.current - now) / 1000);

      if (diff <= 0) {
        setTime(0);
        stopTimer();
        handleComplete(modeRef.current);
      } else {
        setTime(diff);
      }
    }, 1000);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POMODORO);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
 
        const validModes = ["work", "short", "long"];
        const safeMode = validModes.includes(parsed.mode) ? parsed.mode : "work";
        
        setMode(safeMode);
        modeRef.current = safeMode;

        if (parsed.isRunning && parsed.targetEndTime) {
          const remaining = Math.ceil((parsed.targetEndTime - Date.now()) / 1000);

          if (remaining > 0) {
            setTime(remaining);
            startTimer(); 
          } else {
            // Tempo acabou enquanto estava fora
            setTime(0);
            setIsRunning(false);
            handleComplete(safeMode);
          }
        } else {
         
          setTime(parsed.duration || TIMES[safeMode as keyof typeof TIMES]);
        }
      } catch (e) {
        console.error("Erro ao restaurar Pomodoro", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependência vazia intencional para rodar apenas no mount

  const resetTimer = () => {
    stopTimer();
    setTime(TIMES[mode]);
  };

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="box-padrao flex flex-col items-center justify-between h-full">
      {/* Seletor */}
      <div className="flex gap-1 bg-current/5 p-1 rounded-xl mb-2 w-full justify-center border border-current/5">
        {(["work", "short", "long"] as const).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === m 
                ? "bg-current/10 shadow-sm font-bold" 
                : "opacity-60 hover:opacity-100 hover:bg-current/5"
            }`}
          >
            {m === "work" ? "Foco" : m === "short" ? "Curta" : "Longa"}
          </button>
        ))}
      </div>

      {/* Display */}
      <div className="text-center my-4 relative">
        <span className="text-6xl font-bold tracking-tight font-mono tabular-nums">
          {formatTime(time)}
        </span>
        <p className="text-xs opacity-60 font-medium mt-1 uppercase tracking-widest">
          {isRunning ? "Rodando" : "Pausado"}
        </p>
      </div>

      {/* Controles */}
      <div className="flex gap-3 mb-6 w-full px-4">
        <button
          onClick={() => isRunning ? stopTimer() : startTimer()}
          className={`flex-1 py-3 rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isRunning 
              ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200/20" 
              : "bg-primary hover:opacity-90 shadow-primary/20"
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
          className="p-3 bg-current/5 border border-current/10 hover:bg-current/10 rounded-xl transition-all shadow-sm active:scale-95"
          title="Reiniciar Timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs font-semibold bg-current/5 px-5 py-2.5 rounded-full border border-current/5">
        <div className="flex items-center gap-1.5 opacity-80" title="Sessões de Foco">
          <CheckCircle size={14} /> {counts.work}
        </div>
        <div className="w-px h-4 bg-current/20"></div>
        <div className="flex items-center gap-1.5 opacity-80" title="Pausas Curtas">
          <Coffee size={14} /> {counts.short}
        </div>
        <div className="w-px h-4 bg-current/20"></div>
        <div className="flex items-center gap-1.5 opacity-80" title="Pausas Longas">
          <Moon size={14} /> {counts.long}
        </div>
      </div>
    </div>
  );
}