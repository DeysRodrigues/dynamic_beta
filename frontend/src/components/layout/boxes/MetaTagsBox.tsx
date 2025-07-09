"use client";

import { useGoalsContext } from "@/context/GoalsContext";
import { useTaskContext } from "@/context/TaskContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TagsBox() {
  const { goals, addGoal, removeGoal } = useGoalsContext();
  const { completedTimeByTag, getUniqueTags } = useTaskContext();

  const [selectedTag, setSelectedTag] = useState<string>("");
  const [hours, setHours] = useState<number | "">("");

  // Obtém as tags únicas das tarefas
  const uniqueTags = getUniqueTags();

  // Monitore as mudanças no completedTimeByTag
  useEffect(() => {
    console.log("completedTimeByTag atualizado:", completedTimeByTag);
  }, [completedTimeByTag]);

  const handleAddGoal = () => {
    if (!selectedTag || !hours) {
      alert("Por favor, selecione uma tag válida e insira um número de horas.");
      return;
    }

    addGoal({ tag: selectedTag.toLowerCase(), hours: Number(hours) });
    setSelectedTag("");
    setHours("");
  };

  const getCompletedMinutes = (goalTag: string) => completedTimeByTag[goalTag.toLowerCase()] || 0;

  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold mb-4">Definir metas por tags</h2>

      {/* Formulário para adicionar novas metas */}
      <div className="flex gap-2 flex-wrap items-center">
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-2 py-1 rounded bg-white flex-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione uma tag</option>
          {uniqueTags.map((tag, index) => (
            <option key={index} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="horas +"
          value={hours}
          onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
          className="px-2 py-1 rounded bg-white w-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAddGoal}
          className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded hover:opacity-90 transition-opacity"
        >
          Criar meta
        </button>
      </div>

      {/* Lista de metas */}
      <div className="mt-4 space-y-3">
        {goals.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhuma meta definida.</p>
        ) : (
          goals.map((goal, index) => {
            const completedMinutes = getCompletedMinutes(goal.tag);
            const completedHours = +(completedMinutes / 60).toFixed(1);
            const percentage = goal.hours > 0 ? Math.min((completedHours / goal.hours) * 100, 100) : 0;

            return (
              <div key={index} className="bg-white px-4 py-3 rounded shadow space-y-1">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{goal.tag}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(index)}
                  >
                    Remover
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {completedHours}h de {goal.hours}h cumpridas
                </div>
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}