import { useState } from "react";
import { Check, Flame } from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { getTodayDate } from "@/utils/DateUtils";

interface HabitTrackerBoxProps {
  id?: string;
}

export default function HabitTrackerBox({ id = "habit-default" }: HabitTrackerBoxProps) {
  const { getBoxContent, setBoxContent } = useBoxContentStore();
  const content = getBoxContent(id);

  const [habitName, setHabitName] = useState(content.habitName || "Novo Hábito");
  const [checkedDates, setCheckedDates] = useState<string[]>(content.checkedDates || []);
  const [isEditing, setIsEditing] = useState(false);

  // Gera os últimos 7 dias dinamicamente
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const toggleDate = (dateStr: string) => {
    let newDates;
    if (checkedDates.includes(dateStr)) {
      newDates = checkedDates.filter(d => d !== dateStr);
    } else {
      newDates = [...checkedDates, dateStr];
    }
    setCheckedDates(newDates);
    setBoxContent(id, { habitName, checkedDates: newDates });
  };

  const handleNameSave = () => {
    setIsEditing(false);
    setBoxContent(id, { habitName, checkedDates });
  };

  const streak = checkedDates.length;

  return (
    <div className="box-padrao flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {isEditing ? (
            <input
              autoFocus
              className="font-bold text-lg bg-transparent outline-none w-full"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
            />
          ) : (
            <h2 
              onClick={() => setIsEditing(true)}
              className="text-lg font-bold cursor-pointer hover:text-primary transition truncate"
              title="Clique para editar o nome"
            >
              {habitName}
            </h2>
          )}
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Flame size={12} className={streak > 0 ? "text-orange-500" : "text-muted-foreground/50"} />
            {streak} dias marcados
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto gap-1">
        {days.map((date) => {
          const dateStr = date.toISOString().split("T")[0];
          const isChecked = checkedDates.includes(dateStr);
          const isToday = dateStr === getTodayDate();
          
          return (
            <div key={dateStr} className="flex flex-col items-center gap-1 flex-1">
              <span className={`text-[10px] uppercase font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3)}
              </span>
              <button
                onClick={() => toggleDate(dateStr)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isChecked 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100" 
                    : "bg-muted text-transparent hover:bg-muted/80 scale-90"
                }`}
              >
                <Check size={14} strokeWidth={4} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}