import { useTaskStore } from "@/store/useTaskStore";

interface ProgressBoxProps {
  className?: string;
}

export default function ProgressBox({ className }: ProgressBoxProps) {
  const { tasks } = useTaskStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className={`box-padrao ${className || ""}`}>
      <h2 className="text-lg font-semibold">Progresso nas tarefas</h2>
      <p className="text-muted-foreground text-sm mt-1">
        {completedTasks} de {totalTasks} tasks ({progressPercent}%)
      </p>
      <div className="w-full bg-background h-3 rounded-full overflow-hidden mt-3 border">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}