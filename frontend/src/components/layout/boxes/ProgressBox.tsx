import { useTaskContext } from "@/context/TaskContext";

interface ProgressBoxProps {
  className?: string;
}

export default function ProgressBox({ className }: ProgressBoxProps) {
  
  const { tasks } = useTaskContext();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className={`box-padrao ${className}`}>
      <h2 className="text-lg font-semibold">Progresso nas tarefas</h2>
      <p>
        {" "}
        {completedTasks} de {totalTasks} tasks ({progressPercent}%){" "}
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
