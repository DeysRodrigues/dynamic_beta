import { Trash2 } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import TaskItem from "@/components/ui/TaskItem";

interface Task {
  id: string;
  time: string;
  description: string;
  tag: string;
  completed: boolean | undefined;
  date: string;
  duration: number;
}

interface BoxTaskProps {
  filter?: "all" | "completed" | "incomplete";
  className?: string;
}

export default function BoxTask({ filter = "all", className }: BoxTaskProps) {
  const {
    tasks,
    toggleCompleted,
    deleteTask,
    deleteAllTasks,
    addTask,
    importTasks,
  } = useTaskContext();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach((task) => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });
    return grouped;
  };

  const deleteTasksByDate = (date: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir todas as tarefas do dia ${formatDate(
        date
      )}?`
    );
    if (!confirmed) return;

    const tasksOfOtherDates = tasks.filter((task) => task.date !== date);
    importTasks(tasksOfOtherDates);
    deleteAllTasks();
    tasksOfOtherDates.forEach(addTask);
  };

  const filteredTasks = tasks.filter((task) =>
    filter === "all"
      ? true
      : filter === "completed"
      ? task.completed === true
      : task.completed === false
  );

  const grouped = groupTasksByDate(filteredTasks);

  return (
    <div className={`${className} box-padrao`}>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 italic">
          Voce ainda nao possui tasks :(
        </p>
      ) : (
        Object.entries(grouped).map(([date, tasksForDate]) => (
          <div key={date} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{formatDate(date)}</h2>
              <button
                onClick={() => deleteTasksByDate(date)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {tasksForDate.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleCompleted}
                onDelete={deleteTask}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
