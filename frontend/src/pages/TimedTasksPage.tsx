import { useState, useEffect } from "react";
import { Plus, CalendarCheck2 } from "lucide-react";
import TaskItem from "@/components/ui/TaskItem";
import { useTaskContext } from "../context/TaskContext";

interface TimedTask {
  id: string;
  time: string;
  description: string;
  tag: string;
  completed: boolean;
}

function generateTimeBlocks(
  start: string,
  end: string,
  duration: number
): TimedTask[] {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;

  const blocks: TimedTask[] = [];
  let current = startTotal;

  while (current + duration <= endTotal) {
    const hour = String(Math.floor(current / 60)).padStart(2, "0");
    const min = String(current % 60).padStart(2, "0");
    blocks.push({
      id: `${current}-${Math.random()}`,
      time: `${hour}:${min}`,
      description: "",
      tag: "",
      completed: false,
    });

    current += duration;
  }

  return blocks;
}

export default function TimedTasksPage() {
  const {
    addTask,
    updateTask,
    toggleCompleted,
    deleteTask: deleteTaskFromContext,
    tasks,
  } = useTaskContext();

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("14:00");
  const [duration, setDuration] = useState(60);
  const [blocks, setBlocks] = useState<TimedTask[]>([]);
  
  useEffect(() => {
    const timedTasks = tasks.filter((task) => task.source === "timed");
    setBlocks(timedTasks);
  }, [tasks]);

  const handleGenerate = () => {
    if (!startTime || !endTime || duration <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    const result = generateTimeBlocks(startTime, endTime, duration);
    setBlocks(result);
  };

  const handleSaveAll = () => {
    blocks.forEach((task) => {
      addTask({
        ...task,
        date: new Date().toISOString().split("T")[0],
        duration,
        source: "timed", // <- MARCADOR DE ORIGEM
      });
    });
    alert("Tasks salvas com sucesso!");
  };

  const updateBlock = (id: string, field: keyof TimedTask, value: string) => {
    setBlocks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task))
    );
    updateTask(id, { [field]: value });
  };

  const toggleTaskCompleted = (id: string) => {
    setBlocks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    toggleCompleted(id);
  };

  const deleteTask = (id: string) => {
    deleteTaskFromContext(id);
    setBlocks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="space-y-6 pt-28 px-4 sm:p-14">
      {/* Barra Superior */}
      <div className="bg-gray-100 p-4 rounded-xl shadow flex items-center justify-between z-20">
        <span className="font-bold text-lg flex items-center gap-2">
          <CalendarCheck2 size={20} /> Gerar Tarefas por Blocos
        </span>
      </div>

      {/* Seção de Inputs */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4 mt-2">
        <h2 className="text-md font-semibold">Configurações de Blocos</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Início</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-100"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Fim</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-100"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Duração (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="px-4 py-2 rounded-xl bg-gray-100 w-32"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:opacity-90 mt-auto"
          >
            <Plus size={16} /> Gerar Tasks
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 mt-auto"
            disabled={blocks.length === 0}
          >
            Salvar Todas
          </button>
        </div>
      </div>

      {/* Lista de Tarefas Geradas */}
      <div className="space-y-4 mt-10">
        {blocks.length > 0 ? (
          blocks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              editable
              onChange={updateBlock}
              onToggle={() => toggleTaskCompleted(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">Nenhum bloco gerado ainda.</p>
        )}
      </div>
    </div>
  );
}
