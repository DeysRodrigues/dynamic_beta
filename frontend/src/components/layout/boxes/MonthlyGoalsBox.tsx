import { useState } from "react";
import { Target, Plus } from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";

interface Goal { id: string; title: string; checks: boolean[]; } // checks[0..30]

export default function MonthlyGoalsBox({ id = "goals-default" }: { id?: string }) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const saved = getBoxContent(id);
  const [goals, setGoals] = useState<Goal[]>(saved.goals || []);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const save = (data: Goal[]) => {
    setGoals(data);
    setBoxContent(id, { goals: data });
  };

  const addGoal = () => {
    if (!newTitle) return;
    save([...goals, { id: crypto.randomUUID(), title: newTitle, checks: Array(30).fill(false) }]);
    setNewTitle("");
    setIsEditing(false);
  };

  const toggleCheck = (goalIndex: number, dayIndex: number) => {
    const updated = [...goals];
    updated[goalIndex].checks[dayIndex] = !updated[goalIndex].checks[dayIndex];
    save(updated);
  };

  return (
    <div className="box-padrao p-4 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold flex items-center gap-2"><Target size={18} className="text-rose-500"/> Metas 30 Dias</h2>
        <button onClick={() => setIsEditing(!isEditing)} className="text-muted-foreground hover:text-primary"><Plus size={18}/></button>
      </div>

      {isEditing && (
        <div className="flex gap-2 mb-3">
          <input className="flex-1 text-sm border-b border-muted-foreground/50 outline-none bg-transparent" placeholder="Nova Meta (ex: Meditar)" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && addGoal()}/>
          <button onClick={addGoal} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Add</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {goals.map((goal, gIdx) => {
          // Calcula consistência simples (streak)
          const doneCount = goal.checks.filter(Boolean).length;
          const percent = Math.round((doneCount / 30) * 100);
          
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>{goal.title}</span>
                <span className={percent > 70 ? "text-green-600" : "text-muted-foreground/50"}>{percent}%</span>
              </div>
              {/* Grid de 30 dias */}
              <div className="flex flex-wrap gap-[2px]">
                {goal.checks.map((checked, dIdx) => (
                  <div 
                    key={dIdx} 
                    onClick={() => toggleCheck(gIdx, dIdx)}
                    className={`w-2.5 h-2.5 rounded-[1px] cursor-pointer transition-colors ${
                      checked ? "bg-rose-500 hover:bg-rose-600" : "bg-muted hover:bg-muted/80"
                    }`}
                    title={`Dia ${dIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <div className="text-center text-muted-foreground/50 text-xs mt-4">Defina suas metas mensais.</div>}
      </div>
    </div>
  );
}