import {
  CheckCircle,
  Coffee,
  Moon,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { usePomodoroStore } from "@/store/usePomodoroStore";

export default function PomodoroBox() {
  // Conecta com a Store Global
  const {
    timeLeft,
    mode,
    isRunning,
    counts,
    setMode,
    toggleTimer,
    resetTimer,
  } = usePomodoroStore();

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="box-padrao flex flex-col items-center justify-between h-full">
      {/* Seletor */}
      <div className="flex gap-1 bg-current/5 p-1 rounded-xl mb-2 w-full justify-center">
        {(["work", "short", "long"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
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
          {formatTime(timeLeft)}
        </span>
        <p className="text-xs opacity-60 font-medium mt-1 uppercase tracking-widest">
          {isRunning ? "Rodando Globalmente" : "Pausado"}
        </p>
      </div>

      {/* Controles */}
      <div className="flex gap-3 mb-6 w-full px-4">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-3 rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isRunning
              ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200/20"
              : "bg-primary hover:opacity-90 shadow-primary/20"
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={20} fill="currentColor" /> PAUSAR
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" /> INICIAR
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 bg-current/5 hover:bg-current/10 rounded-xl transition-all shadow-sm active:scale-95"
          title="Reiniciar Timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs font-semibold bg-current/5 px-5 py-2.5 rounded-full">
        <div
          className="flex items-center gap-1.5 opacity-80"
          title="Sessões de Foco"
        >
          <CheckCircle size={14} /> {counts.work}
        </div>
        <div className="w-px h-4 bg-current/20"></div>
        <div
          className="flex items-center gap-1.5 opacity-80"
          title="Pausas Curtas"
        >
          <Coffee size={14} /> {counts.short}
        </div>
        <div className="w-px h-4 bg-current/20"></div>
        <div
          className="flex items-center gap-1.5 opacity-80"
          title="Pausas Longas"
        >
          <Moon size={14} /> {counts.long}
        </div>
      </div>
    </div>
  );
}
