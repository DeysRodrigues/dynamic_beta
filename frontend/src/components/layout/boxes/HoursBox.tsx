import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";

export default function HoursBox() {
  const { tasks } = useTaskContext();

  const [goalHours, setGoalHours] = useState<number>(() => {
    // Tenta carregar a meta salva no localStorage
    const saved = localStorage.getItem("goalHours");
    return saved ? Number(saved) : 0;
  });

  const [inputHours, setInputHours] = useState<string>(goalHours.toString());

  // Filtra só as tasks do dia de hoje
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysTasks = tasks.filter((task) => task.date === todayStr);

  // Soma a duração (em minutos) das tasks de hoje
  const totalMinutes = todaysTasks.reduce((acc, task) => {
    // Supondo que cada task tenha a propriedade `duration` em minutos
    // Caso não tenha, adapte de acordo
    return acc + (task.duration || 0);
  }, 0);

  // Converte minutos para horas
  const plannedHours = totalMinutes / 60;

  // Calcula o progresso em %
  const progressPercent = goalHours
    ? Math.min((plannedHours / goalHours) * 100, 100)
    : 0;

  // Quando usuário clica para definir a meta
  const handleSetGoal = () => {
    const num = Number(inputHours);
    if (num > 0) {
      setGoalHours(num);
      localStorage.setItem("goalHours", num.toString());
    }
  };

  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold">
        Qual sua meta de horas produtividade para hoje?
      </h2>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          min={0}
          step={0.1}
          placeholder="Horas"
          value={inputHours}
          onChange={(e) => setInputHours(e.target.value)}
          className="w-20 px-2 py-1 rounded bg-white text-center"
        />
        <button
          onClick={handleSetGoal}
          className="px-4 py-1 bg-primary text-white rounded"
        >
          Definir meta
        </button>
      </div>
      <p className="text-sm">
        Você já planejou {plannedHours.toFixed(1)}h da sua meta diária (
        {progressPercent.toFixed(0)}%)
      </p>
      <div className="w-full bg-white h-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}
