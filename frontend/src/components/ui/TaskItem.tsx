import { Trash2 } from "lucide-react";

interface Task {
  id: string;
  time: string;
  description: string;
  tag?: string;
  completed: boolean | undefined;
}

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChange?: (id: string, field: keyof Task, value: string) => void;
  editable?: boolean;
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onChange,
  editable = false,
}: TaskItemProps) {
  return (
    <div className="flex justify-between items-center gap-2 bg-white-100 w-full p-3 rounded-full sm:flex-row sm:bg-white">
      <div className="flex w-full sm:w-[90%] ">
        {/* Hora */}
        <input
          type="time"
          value={task.time}
          readOnly
          className="text-center text-gray-700 font-bold p-1 rounded-lg"
        />

        {/* Descrição */}
        <input
          type="text"
          value={task.description}
          onChange={(e) =>
            editable && onChange?.(task.id, "description", e.target.value)
          }
          readOnly={!editable}
          className={`text-gray-600 font-medium text-[0.9rem] flex-1 rounded-lg px-3 py-1 text-center w-full ${
            task.completed ? "bg-emerald-100" : "bg-white"
          }`}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Campo de tag se editável */}
        {editable && (
          <input
            type="text"
            placeholder="Tag"
            value={task.tag ?? ""}
            onChange={(e) =>
              editable && onChange?.(task.id, "tag", e.target.value)
            }
            className="w-24 px-2 py-1 rounded-lg bg-gray-100"
          />
        )}

        {/* Check de conclusão */}
        {onToggle && (
          <div
            onClick={() => onToggle(task.id)}
            className={`
    w-6 h-6 rounded-full cursor-pointer border
 ${
   task.completed === undefined
     ? "bg-gray-300 border-gray-400"
     : task.completed === true
     ? "bg-green-500 border-green-600"
     : "bg-red-500 border-red-600"
 }


  `}
          ></div>
        )}

        {/* Lixeira */}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-800 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
