import { useState } from "react";
import { Plus, Trash2, Filter } from "lucide-react";
import TasksImportBox from "../components/layout/boxes/TasksImportBox";
import { useTaskContext } from "../context/TaskContext";
import TaskItem from "@/components/ui/TaskItem";
import { useTagContext } from "../context/useTagContext";
import { groupTasksByDate, parseDuration } from "@/utils/TaskUtils";
import { formatDate } from "@/utils/DateUtils";
import { createTask } from "@/utils/TaskFactory";

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
  const [bulkTaskInput, setBulkTaskInput] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTag, setBulkTag] = useState("");
  const [bulkDuration, setBulkDuration] = useState<number>(15); // duração padrão por tarefa
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );

  const [newDuration, setNewDuration] = useState<number>(0);

  // Função para adicionar task, incluindo a duração:
  const handleAddTask = () => {
    if (!newTime || !newDescription) return;

    if (!newTime || !newDescription || newDuration <= 0) {
      alert(
        "Preencha todos os campos corretamente, incluindo duração maior que zero."
      );
      return;
    }
    const newTask = createTask(newDescription, newTime, newTag, newDuration);
    addTask(newTask);

    setNewTime("");
    setNewDescription("");
    setNewTag("");
  };

  const deleteTasksByDate = (date: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir todas as tarefas do dia ?`
    );
    if (!confirmed) return;

    const tasksOfOtherDates = tasks.filter((task) => task.date !== date);
    // Atualiza o estado filtrando todas as tasks da data
    importTasks(tasksOfOtherDates);
    deleteAllTasks(); // Limpa tudo antes de importar de volta
    tasksOfOtherDates.forEach(addTask); // Reinsere as tasks válidas
  };

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
          <button
            onClick={() => setShowBulkModal(true)}
            className="p-2 bg-white rounded-full hover:bg-gray-200 text-sm"
            title="Adicionar várias tarefas"
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

      {/* Modal para adicionar várias tarefas */}
{showBulkModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">Adicionar várias tarefas</h3>
      <p className="text-sm text-gray-600">
        Digite uma tarefa por linha, começando com <code>-</code> ou <code>*</code>.
      </p>

      <textarea
        value={bulkTaskInput}
        onChange={(e) => setBulkTaskInput(e.target.value)}
        placeholder="- Arrumar a casa&#10;- Lavar louça&#10;- Fazer compras"
        className="w-full h-40 p-3 border rounded-lg font-mono"
      />

      <div className="flex flex-wrap gap-3">
        {tags.length > 0 ? (
          <select
            value={bulkTag}
            onChange={(e) => setBulkTag(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Tag (opcional)</option>
            {tags.map((tag, idx) => (
              <option key={idx} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        ) : null}

        <input
          type="number"
          placeholder="Duração (min)"
          value={bulkDuration}
          onChange={(e) => setBulkDuration(Number(e.target.value))}
          min="1"
          className="w-32 px-3 py-2 border rounded-lg"
        />

        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowBulkModal(false)}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            if (!newTime) {
              alert("Selecione um horário inicial.");
              return;
            }
            if (!bulkTaskInput.trim()) {
              alert("Digite pelo menos uma tarefa.");
              return;
            }

            // Processar as linhas
            const lines = bulkTaskInput
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.startsWith("- ") || line.startsWith("* "));

            if (lines.length === 0) {
              alert("Nenhuma tarefa válida encontrada. Use '- ' no início de cada linha.");
              return;
            }

            let currentTime = newTime;
            const tasksToAdd = [];

            for (const line of lines) {
              const description = line.substring(2).trim(); // remove "- " ou "* "
              if (!description) continue;

              const task = createTask(description, currentTime, bulkTag, bulkDuration);
              tasksToAdd.push(task);

              // Calcular próximo horário com base na duração
              const [hours, minutes] = currentTime.split(":").map(Number);
              const totalMinutes = hours * 60 + minutes + bulkDuration;
              const nextHours = Math.floor(totalMinutes / 60) % 24;
              const nextMinutes = totalMinutes % 60;
              currentTime = `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
            }

            tasksToAdd.forEach(addTask);
            setShowBulkModal(false);
            setBulkTaskInput("");
            setBulkTag("");
          }}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Adicionar  tarefas
        </button>
      </div>
    </div>
  </div>
)}

      {/* Formulário de Nova Task */}
      <div className="bg- flex flex-wrap gap-2">
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
