import { CheckCircle, Coffee, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function PomodoroBox() {
  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [time, setTime] = useState<number>(WORK_TIME);
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [workCount, setWorkCount] = useState<number>(0);
  const [shortBreakCount, setShortBreakCount] = useState<number>(0);
  const [longBreakCount, setLongBreakCount] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef<"work" | "short" | "long">(mode);
  const timeLeftRef = useRef<number>(time);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    timeLeftRef.current = time;
  }, [time]);

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  useEffect(() => {
  const saved = localStorage.getItem("pomodoro");
  if (!saved) return;

  const { startTime, duration, mode: savedMode, isRunning } = JSON.parse(saved);
  setMode(savedMode);
  
  if (isRunning && startTime) {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = duration - elapsed;

    if (remaining > 0) {
      setTime(remaining);
      timeLeftRef.current = remaining;
      setIsRunning(true);
      startTimer();
    } else {
      // tempo já acabou
      setTime(0);
      timeLeftRef.current = 0;
      setIsRunning(false);
      handleEnd();
    }
  } else {
    setTime(duration);
    timeLeftRef.current = duration;
    setIsRunning(false);
  }
}, []);


  const startTimer = () => {
    if (timerRef.current) return;

    const startTimestamp = Date.now();
    localStorage.setItem(
      "pomodoro",
      JSON.stringify({
        startTime: startTimestamp,
        duration: timeLeftRef.current,
        mode,
        isRunning: true,
      })
    );

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTime(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        stopTimer();
        setIsRunning(false);
        handleEnd();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    localStorage.setItem(
      "pomodoro",
      JSON.stringify({
        startTime: null,
        duration: timeLeftRef.current,
        mode,
        isRunning: false,
      })
    );
  };

  const handleModeChange = (selectedMode: "work" | "short" | "long") => {
    stopTimer();
    setIsRunning(false);
    setMode(selectedMode);

    if (selectedMode === "work") {
      setTime(WORK_TIME);
      timeLeftRef.current = WORK_TIME;
    }
    if (selectedMode === "short") {
      setTime(SHORT_BREAK);
      timeLeftRef.current = SHORT_BREAK;
    }
    if (selectedMode === "long") {
      setTime(LONG_BREAK);
      timeLeftRef.current = LONG_BREAK;
    }
  };

  const handleStartPause = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
    setIsRunning(!isRunning);
  };

  const handleEnd = () => {
    let message = "";

    if (modeRef.current === "work") {
      message = "Tempo de trabalho finalizado! Hora da pausa.";
      setWorkCount((prev) => prev + 1);
    }
    if (modeRef.current === "short") {
      message = "Pausa curta finalizada! Volte ao trabalho.";
      setShortBreakCount((prev) => prev + 1);
    }
    if (modeRef.current === "long") {
      message = "Pausa longa finalizada! Volte ao trabalho.";
      setLongBreakCount((prev) => prev + 1);
    }

    sendNotification("Pomodoro", message);

    setTimeout(() => {
      alert(message);
    }, 200);
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });

      const audio = new Audio("/notify.mp3");
      audio.volume = 0.2;
      audio.playbackRate = 0.8;
      audio.play().catch((err) => {
        console.log("O áudio não pôde ser reproduzido automaticamente:", err);
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="box-padrao flex flex-col items-center">
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => handleModeChange("work")}
          className={`px-4 py-1 rounded ${
            mode === "work" ? "bg-primary text-white" : "bg-indigo-200"
          }`}
        >
          work
        </button>
        <button
          onClick={() => handleModeChange("long")}
          className={`px-4 py-1 rounded ${
            mode === "long" ? "bg-primary text-white" : "bg-indigo-200"
          }`}
        >
          long break
        </button>
        <button
          onClick={() => handleModeChange("short")}
          className={`px-4 py-1 rounded ${
            mode === "short" ? "bg-primary text-white" : "bg-indigo-200"
          }`}
        >
          short break
        </button>
      </div>
      <h2 className="text-center font-semibold text-gray-700">Pomodoro</h2>
      <p className="text-5xl text-center font-bold">{formatTime(time)}</p>
      <button
        onClick={handleStartPause}
        className="mt-4 px-6 py-2 bg-primary text-white rounded"
      >
        {isRunning ? "pause" : "start"}
      </button>

      <div className="mt-4 text-center space-y-1">
        <p className="flex font-bold items-center justify-center gap-2 text-green-600">
          <CheckCircle size={18} /> Work concluídos: {workCount}
        </p>
        <p className="flex font-bold items-center justify-center gap-2 text-yellow-600">
          <Coffee size={18} /> Short breaks: {shortBreakCount}
        </p>
        <p className="flex font-bold items-center justify-center gap-2 text-purple-600">
          <Moon size={18} /> Long breaks: {longBreakCount}
        </p>
      </div>
    </div>
  );
}
