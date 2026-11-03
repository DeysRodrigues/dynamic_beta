import { useEffect } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";

export default function PomodoroManager() {
  const { isRunning, timeLeft, syncTime, setMode, addCount, mode } = usePomodoroStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        syncTime(); // Syncs the store with the real time
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, syncTime]);

  // Detects the end of the timer (00:00)
  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      // 1. Tocar Som
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      // 2. Notification
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Finalizado!", { 
          body: mode === 'work' ? "Hora da pausa!" : "Bora focar!" 
        });
      }

      // 3. Contabilizar
      // Only counts when the time is exactly 0, to avoid a double count on re-renders
      // The store has already paused (isRunning = false), so this is safe.
      // We need to check whether it just reached zero. 
      // The box already shows the stopped state.
      // All that is left is to add the count and switch the mode.
      
      addCount(mode);

      // 4. Switch mode automatically
      if (mode === "work") setMode("short");
      else setMode("work");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning]); 

  // Updates the browser tab title
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, "0");
    const label = mode === "work" ? "Foco" : "Pausa";
    document.title = `${mins}:${secs} - ${label}`;
  }, [timeLeft, mode]);

  return null; // Invisible component
}