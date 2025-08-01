import { useState } from "react";
import { Plus, Trash2, Filter } from "lucide-react";
import TasksImportBox from "../components/layout/boxes/TasksImportBox";
import { useTaskContext } from "../context/TaskContext";
import TaskItem from "@/components/ui/TaskItem";
import { useTagContext } from "../context/useTagContext";

interface Task {
  id: string;
  time: string;
  description: string;
  tag: string;
  completed: boolean | undefined;

  date: string;
  duration: number;
}

export default function TasksPage() {
  const {
    tasks,
    addTask,
    toggleCompleted,
    deleteTask,
    deleteAllTasks,
    importTasks,
  } = useTaskContext();

  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showImportBox, setShowImportBox] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );

  const [newDuration, setNewDuration] = useState<number>(0);

  // Função para adicionar task, incluindo a duração:
  const handleAddTask = () => {
    if (!newTime || !newDescription) return;

    const newTask: Task = {
      id: Date.now().toString(),
      time: newTime,
      description: newDescription,
      tag: newTag,
      completed: false,
      date: new Date().toISOString().split("T")[0],
      duration: newDuration,
    };
    if (!newTime || !newDescription || newDuration <= 0) {
      alert(
        "Preencha todos os campos corretamente, incluindo duração maior que zero."
      );
      return;
    }
    addTask(newTask);
    setNewTime("");
    setNewDescription("");
    setNewTag("");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const deleteTasksByDate = (date: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir todas as tarefas do dia ${formatDate(
        date
      )}?`
    );
    if (!confirmed) return;

    const tasksOfOtherDates = tasks.filter((task) => task.date !== date);
    // Atualiza o estado filtrando todas as tasks da data
    importTasks(tasksOfOtherDates);
    deleteAllTasks(); // Limpa tudo antes de importar de volta
    tasksOfOtherDates.forEach(addTask); // Reinsere as tasks válidas
  };

  function parseDuration(duration?: string | number): number {
    if (!duration) return 0;

    if (typeof duration === "number") return duration;

    // Se for string no formato "HH:mm"
    const parts = duration.split(":");
    if (parts.length === 2) {
      const hours = Number(parts[0]) || 0;
      const minutes = Number(parts[1]) || 0;
      return hours * 60 + minutes;
    }

    // Se for só número em string
    const asNumber = Number(duration);
    return isNaN(asNumber) ? 0 : asNumber;
  }

  const { tags } = useTagContext();

  return (
    <div className="space-y-6 pt-28 px-4 relative sm:p-14">
      {/* Barra fixa no topo */}
      <div className="bg-gray-100 p-4 rounded-xl shadow flex items-center justify-between z-20">
        <span className="font-bold text-lg">Tarefas</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilter((prev) =>
                prev === "all"
                  ? "completed"
                  : prev === "completed"
                  ? "incomplete"
                  : "all"
              );
            }}
            className="p-2 bg-white rounded-full hover:bg-gray-200"
            title="Filtrar Tasks"
          >
            <Filter size={18} />
          </button>

          <button
            onClick={deleteAllTasks}
            className="p-2 bg-white rounded-full hover:bg-red-200"
            title="Apagar todas as tasks"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={() => setShowImportBox(true)}
            className="p-2 bg-white rounded-full hover:bg-gray-200"
            title="Importar Tasks"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Importador de Tasks */}
      {showImportBox && (
        <TasksImportBox
          onImport={(imported) => {
            const newTasks = imported.map((task) => ({
              id: Date.now().toString() + Math.random().toString(36),
              time: task.time,
              description: task.description,
              tag: task.tag,
              completed: false,
              date: new Date().toISOString().split("T")[0],
              duration: parseDuration(task.duration),
            }));
            importTasks(newTasks);
            setShowImportBox(false);
          }}
          onClose={() => setShowImportBox(false)}
        />
      )}

      {/* Formulário de Nova Task */}
      <div className="flex flex-wrap gap-2">
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-100"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 min-w-[200px]"
        />
        {tags.length > 0 ? (
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-28 px-4 py-2 rounded-xl bg-gray-100"
          >
            <option value="">Selecionar tag</option>
            {tags.map((tag, index) => (
              <option key={index} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-28 px-4 py-2 rounded-xl bg-yellow-100 text-yellow-800 text-sm flex items-center justify-center">
            Adicionar tags?
          </div>
        )}

        <input
          type="number"
          placeholder="Duração (min)"
          value={newDuration}
          onChange={(e) => setNewDuration(Number(e.target.value))}
          className="w-28 px-4 py-2 rounded-xl bg-gray-100"
        />

        <button
          onClick={handleAddTask}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:opacity-90"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {/* Lista de Tasks Agrupadas por Data */}
      <div className="space-y-6 mt-20">
        {Object.entries(
          groupTasksByDate(
            tasks.filter((task) =>
              filter === "all"
                ? true
                : filter === "completed"
                ? task.completed === true
                : task.completed === false
            )
          )
        ).map(([date, tasksForDate]) => (
          <div
            key={date}
            className="bg-gray-10 p-4 rounded-xl shadow space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{formatDate(date)}</h2>
              <button
                onClick={() => deleteTasksByDate(date)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {tasksForDate
              .filter((task) =>
                filter === "all"
                  ? true
                  : filter === "completed"
                  ? task.completed
                  : !task.completed
              )
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleCompleted}
                  onDelete={deleteTask}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
