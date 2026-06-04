import { useState, useMemo, useCallback } from "react";
import { useWeekStore } from "@/store/useWeekStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore";
import { getTodayDate, getDaysArray } from "@/utils/DateUtils";
import type { Task } from "@/types/Task";
import type { WeekGroup } from "@/store/useWeekStore";
import { useShallow } from "zustand/react/shallow";

export function useWeekPlanner() {
  // Selectors otimizados do Zustand
  const { weeks, activeWeekId, addWeek, removeWeek, setActiveWeek } = useWeekStore(
    useShallow((state) => ({
      weeks: state.weeks,
      activeWeekId: state.activeWeekId,
      addWeek: state.addWeek,
      removeWeek: state.removeWeek,
      setActiveWeek: state.setActiveWeek,
    }))
  );

  const tasks = useTaskStore((state) => state.tasks);
  const toggleCompleted = useTaskStore((state) => state.toggleCompleted);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const tags = useTagStore((state) => state.tags);

  // Estados locais para formulários e modais
  const [isCreating, setIsCreating] = useState(false);
  const [newWeekName, setNewWeekName] = useState("");
  const [startData, setStartData] = useState(getTodayDate());
  const [endData, setEndData] = useState(getTodayDate());
  const [selectedMainTag, setSelectedMainTag] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkEditDate, setBulkEditDate] = useState<string | null>(null);

  // Filtros
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const activeWeek = useMemo(() => 
    weeks.find((w) => w.id === activeWeekId), 
    [weeks, activeWeekId]
  );

  const weekDays = useMemo(() => 
    activeWeek ? getDaysArray(activeWeek.startDate, activeWeek.endDate) : [],
    [activeWeek]
  );

  // Mapa de tarefas agrupadas por data para performance O(1) no grid
  const tasksByDate = useMemo(() => {
    if (!activeWeek) return {};
    const map: Record<string, Task[]> = {};
    
    // Inicializa o mapa com as datas da semana
    weekDays.forEach(date => {
      map[date] = [];
    });

    // Filtra tarefas que pertencem a esta Tagzona e estão dentro do range da semana
    tasks.forEach(task => {
      if (task.groupTag === activeWeek.mainTag && map[task.date]) {
        map[task.date].push(task);
      }
    });

    // Ordena as tarefas por horário
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
    });

    return map;
  }, [tasks, activeWeek, weekDays]);

  // Handlers memorizados
  const handleCreateWeek = useCallback(() => {
    if (!newWeekName) return alert("Dê um nome para o grupo semanal.");
    if (!selectedMainTag) return alert("Selecione uma Tagzona para representar este grupo.");
    
    const newWeek: WeekGroup = {
      id: crypto.randomUUID(),
      name: newWeekName,
      startDate: startData,
      endDate: endData,
      mainTag: selectedMainTag,
    };
    
    addWeek(newWeek);
    setActiveWeek(newWeek.id);
    setIsCreating(false);
    setNewWeekName("");
    setSelectedMainTag("");
  }, [newWeekName, selectedMainTag, startData, endData, addWeek, setActiveWeek]);

  const openAddModal = useCallback((date: string) => {
    setSelectedDateForModal(date);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback((task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  }, []);

  const openBulkEdit = useCallback((date: string) => {
    setBulkEditDate(date);
  }, []);

  const handleDropTask = useCallback((taskId: string, newDate: string) => {
    updateTask(taskId, { date: newDate });
  }, [updateTask]);

  // Estatísticas do Ciclo
  const stats = useMemo(() => {
    const allWeekTasks = Object.values(tasksByDate).flat();
    const total = allWeekTasks.length;
    const completed = allWeekTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, rate };
  }, [tasksByDate]);

  return {
    // Estado
    weeks,
    activeWeek,
    activeWeekId,
    weekDays,
    tasksByDate,
    tags,
    isCreating,
    newWeekName,
    startData,
    endData,
    selectedMainTag,
    modalOpen,
    selectedDateForModal,
    editingTask,
    editModalOpen,
    bulkEditDate,
    filter,
    stats,

    // Setters
    setIsCreating,
    setNewWeekName,
    setStartData,
    setEndData,
    setSelectedMainTag,
    setModalOpen,
    setEditModalOpen,
    setBulkEditDate,
    setFilter,

    // Actions
    setActiveWeek,
    removeWeek,
    toggleCompleted,
    deleteTask,
    addTask,
    handleCreateWeek,
    openAddModal,
    handleEditClick,
    openBulkEdit,
    handleDropTask
  };
}
