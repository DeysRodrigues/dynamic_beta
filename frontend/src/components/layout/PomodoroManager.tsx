import { useEffect, useRef } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";

export default function PomodoroManager() {
  const { isRunning, timeLeft, syncTime, setMode, addCount, mode } = usePomodoroStore();
  const finishedRef = useRef(false);

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
    if (timeLeft !== 0 || isRunning) {
      finishedRef.current = false;
      return;
    }
    // The effect also re-runs when `mode` changes, so only the first pass at zero counts.
    if (!finishedRef.current) {
      finishedRef.current = true;
      // 1. Play sound
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      // 2. Notification
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Finalizado!", { 
          body: mode === 'work' ? "Hora da pausa!" : "Bora focar!" 
        });
      }

      // 3. Count it
      addCount(mode);

      // 4. Switch mode automatically
      if (mode === "work") setMode("short");
      else setMode("work");
    }
  }, [timeLeft, isRunning, mode, addCount, setMode]);

  // Updates the browser tab title
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, "0");
    const label = mode === "work" ? "Foco" : "Pausa";
    document.title = `${mins}:${secs} - ${label}`;
  }, [timeLeft, mode]);

  return null; // Invisible component
}