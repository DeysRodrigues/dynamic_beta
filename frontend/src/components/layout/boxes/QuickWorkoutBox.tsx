import { useState, useEffect } from "react";
import { Dumbbell, RotateCcw, CheckCircle } from "lucide-react";

// CORREÇÃO: Constante fora do componente
const routine = [
  { name: "Polichinelos", time: 30 },
  { name: "Flexões (ou Parede)", time: 20 },
  { name: "Agachamentos", time: 30 },
  { name: "Prancha", time: 20 },
  { name: "Alongamento", time: 20 },
];

export default function QuickWorkoutBox() {
  const [step, setStep] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // CORREÇÃO: Tipagem do intervalo
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      if (step < routine.length - 1) {
        setStep(s => s + 1);
        setTimeLeft(routine[step + 1].time);
      } else {
        setIsActive(false);
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, step]);

  const start = () => {
    setStep(0);
    setTimeLeft(routine[0].time);
    setIsActive(true);
  };

  const reset = () => {
    setIsActive(false);
    setStep(-1);
  };

  const isFinished = step === routine.length - 1 && timeLeft === 0;

  return (
    <div className="box-padrao bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
      {step === -1 && !isFinished && (
        <>
          <div className="bg-orange-100 p-4 rounded-full mb-4 text-orange-600"><Dumbbell size={32} /></div>
          <h2 className="font-bold text-orange-800 text-lg">Pausa Ativa</h2>
          <p className="text-orange-600/70 text-sm mb-4">2 min para energizar o corpo.</p>
          <button onClick={start} className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-orange-600 transition">Iniciar</button>
        </>
      )}

      {isActive && (
        <>
          <span className="text-xs uppercase font-bold text-orange-400 tracking-widest mb-2">Exercício {step + 1}/{routine.length}</span>
          <h2 className="text-2xl font-black mb-4">{routine[step].name}</h2>
          <div className="text-6xl font-mono text-orange-600 font-bold mb-6 tabular-nums">{timeLeft}s</div>
          <button onClick={reset} className="text-muted-foreground hover:text-destructive text-sm flex items-center gap-1"><RotateCcw size={14}/> Cancelar</button>
        </>
      )}

      {isFinished && (
        <div className="animate-in zoom-in duration-300">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Treino Concluído!</h2>
          <p className="text-muted-foreground text-sm mb-4">Você é incrível.</p>
          <button onClick={reset} className="text-primary text-sm font-semibold hover:underline">Voltar</button>
        </div>
      )}
    </div>
  );
}