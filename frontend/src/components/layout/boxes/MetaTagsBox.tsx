import { useState } from "react";
import { useGoalStore } from "@/store/useGoalStore";
import { useTaskStore } from "@/store/useTaskStore";
import { Trash2 } from "lucide-react";

export default function MetaTagsBox() {
  const { goals, addGoal, removeGoal } = useGoalStore();
  const { getUniqueTags, getCompletedTimeByTag } = useTaskStore();

  const [selectedTag, setSelectedTag] = useState<string>("");
  const [hours, setHours] = useState<string>("");

  const uniqueTags = getUniqueTags();
  const completedTimeByTag = getCompletedTimeByTag();

  const handleAddGoal = () => {
    if (!selectedTag || !hours || Number(hours) <= 0) {
      alert("Selecione uma tag e um número de horas válido.");
      return;
    }
    addGoal({ tag: selectedTag.toLowerCase(), hours: Number(hours) });
    setSelectedTag("");
    setHours("");
  };

  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Metas por Categoria</h2>

      <div className="flex gap-2 mb-4">
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Tag...</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="h"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-16 px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-center outline-none focus:ring-2 focus:ring-indigo-100"
        />
        
        <button
          onClick={handleAddGoal}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center">Sem metas definidas.</p>
        ) : (
          goals.map((goal, index) => {
            const completedMinutes = completedTimeByTag[goal.tag.toLowerCase()] || 0;
            const completedHours = Number((completedMinutes / 60).toFixed(1));
            const percentage = Math.min((completedHours / goal.hours) * 100, 100);

            return (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="capitalize font-semibold text-gray-700">{goal.tag}</span>
                  <button onClick={() => removeGoal(index)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 mb-1 flex justify-between">
                  <span>{completedHours}h feitas</span>
                  <span>Meta: {goal.hours}h</span>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
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