import { useState } from "react";
import { useGoalStore } from "@/store/useGoalStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useTagStore } from "@/store/useTagStore"; 
import { Trash2, Plus } from "lucide-react";

export default function MetaTagsBox() {
  const { goals, addGoal, removeGoal } = useGoalStore();
  const { getCompletedTimeByTag } = useTaskStore(); 
  const { tags } = useTagStore();

  const [selectedTag, setSelectedTag] = useState<string>("");
  const [hours, setHours] = useState<string>("");

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
    <div className="box-padrao flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Metas por Categoria</h2>

      {/* --- ÁREA DE INPUT --- */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tag...</option>
         
          {tags.map((tag) => (
            <option key={tag} value={tag} className="text-black">{tag}</option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="h"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-16 px-2 py-2 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20"
        />
        
        <button
          onClick={handleAddGoal}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors shadow-sm"
          title="Adicionar Meta"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* --- LISTA DE METAS --- */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 italic text-sm py-4">
            <p>Nenhuma meta definida.</p>
          </div>
        ) : (
          goals.map((goal, index) => {
            // Busca o tempo completado (agora somando Tag + Tagzona)
            const completedMinutes = completedTimeByTag[goal.tag.toLowerCase()] || 0;
            const completedHours = Number((completedMinutes / 60).toFixed(1));
            const percentage = Math.min((completedHours / goal.hours) * 100, 100);

            return (
              <div 
                key={index} 
                className="bg-current/5 p-3 rounded-xl hover:bg-current/10 transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="capitalize font-bold text-sm">{goal.tag}</span>
                  <button 
                    onClick={() => removeGoal(index)} 
                    className="opacity-40 hover:opacity-100 hover:text-red-500 transition-opacity p-1"
                    title="Remover Meta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="text-[10px] opacity-70 mb-1.5 flex justify-between font-medium">
                  <span>{completedHours}h feitas</span>
                  <span>Meta: {goal.hours}h</span>
                </div>

                <div className="w-full bg-current/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out shadow-sm"
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