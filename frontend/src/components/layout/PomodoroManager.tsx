import { useEffect } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";

export default function PomodoroManager() {
  const { isRunning, timeLeft, syncTime, setMode, addCount, mode } = usePomodoroStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        syncTime(); // Sincroniza o store com o tempo real
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, syncTime]);

  // Efeito para detectar o fim do timer (00:00)
  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      // 1. Tocar Som
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      // 2. Notificação
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Finalizado!", { 
          body: mode === 'work' ? "Hora da pausa!" : "Bora focar!" 
        });
      }

      // 3. Contabilizar
      // Pequeno hack: só conta se o tempo for EXATAMENTE 0 para evitar duplo count em re-renders
      // O store já pausou (isRunning = false), então é seguro.
      // Precisamos verificar se acabamos de chegar no zero. 
      // Mas para simplificar: a Box já mostra o estado parado.
      // Vamos apenas adicionar o count e trocar o modo aqui.
      
      addCount(mode);

      // 4. Trocar modo automático
      if (mode === "work") setMode("short");
      else setMode("work");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning]); 

  // Atualiza o título da aba do navegador
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, "0");
    const label = mode === "work" ? "Foco" : "Pausa";
    document.title = `${mins}:${secs} - ${label}`;
  }, [timeLeft, mode]);

  return null; // Componente invisível
}