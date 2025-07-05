import { createContext, useState, useContext, useEffect, useMemo } from "react";

// Definição da interface Task
interface Task {
  id: string;
  time: string; // Formato HH:mm
  description: string;
  tag: string;
  completed: boolean;
  date: string;
  duration: number; // Duração em minutos
}

// Definição da interface TaskContextType
interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteAllTasks: () => void;
  importTasks: (importedTasks: Task[]) => void;
  completedTimeByTag: Record<string, number>; // Tempo cumprido por tag
  getUniqueTags: () => string[]; // Função para obter tags únicas
}

// Criação do contexto
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Hook personalizado para acessar o contexto
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

// Provedor do contexto
export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  // Carrega as tarefas do localStorage ao inicializar
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tasks");
        const parsed = saved ? JSON.parse(saved) : [];
        console.log("Tarefas carregadas do localStorage:", parsed);
        return parsed;
      } catch (error) {
        console.error("Erro ao carregar tasks do localStorage:", error);
        return [];
      }
    }
    return [];
  });

  // Salva as tarefas no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      console.log("Salvando tasks no localStorage:", tasks);
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Erro ao salvar tasks no localStorage:", error);
    }
  }, [tasks]);

  // Adiciona uma nova tarefa
  const addTask = (newTask: Task) => {
    if (
      !newTask.id ||
      !newTask.time ||
      !newTask.description ||
      !newTask.tag ||
      typeof newTask.duration !== "number" ||
      newTask.duration <= 0
    ) {
      console.error("Tarefa inválida. Verifique os valores.");
      return;
    }

    setTasks((prev) => [...prev, newTask]);
  };

  // Alterna o estado de conclusão de uma tarefa
  const toggleCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Remove uma tarefa específica
  const deleteTask = (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir a tarefa?"
    );
    if (confirmed) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  // Remove todas as tarefas
  const deleteAllTasks = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir todas as tarefas?"
    );
    if (confirmed) {
      setTasks([]);
    }
  };

  // Importa múltiplas tarefas de uma vez
  const importTasks = (importedTasks: Task[]) => {
    if (!Array.isArray(importedTasks)) {
      console.error("Dados inválidos para importação de tarefas.");
      return;
    }
    setTasks((prev) => [...prev, ...importedTasks]);
  };

  // Calcula o tempo cumprido por tag
  const completedTimeByTag = useMemo(() => {
    console.log("Recalculando completedTimeByTag...");
    return tasks.reduce<Record<string, number>>((acc, task) => {
      if (task.completed) {
        acc[task.tag.toLowerCase()] =
          (acc[task.tag.toLowerCase()] || 0) + task.duration;
      }
      return acc;
    }, {});
  }, [tasks]);

  // Obtém as tags únicas das tarefas
  const getUniqueTags = (): string[] => {
    const tags = tasks.map((task) => task.tag.toLowerCase());
    return Array.from(new Set(tags)).filter((tag) => tag.trim() !== "");
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleCompleted,
        deleteTask,
        deleteAllTasks,
        importTasks,
        completedTimeByTag,
        getUniqueTags,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
