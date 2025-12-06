import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";

export default function MiniCalendarBox() {
  const { tasks } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filtra tarefas do mês atual
  const tasksInMonth = tasks.filter(t => {
      const d = new Date(t.date + "T00:00");
      return d.getMonth() === month && d.getFullYear() === year;
  });

  const hasTaskOnDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasksInMonth.some(t => t.date === dayStr && !t.completed);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDay = today.getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const hasTask = hasTaskOnDay(d);
      const isToday = isCurrentMonth && d === todayDay;

      days.push(
        <div key={d} className="flex flex-col items-center justify-center h-8 relative group cursor-default">
          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
            isToday ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
          }`}>
            {d}
          </span>
          {hasTask && !isToday && (
            <span className="absolute bottom-0.5 w-1 h-1 bg-red-400 rounded-full"></span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="box-padrao p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <CalendarDays size={18} className="text-primary"/>
           <h2 className="font-bold capitalize text-sm">
             {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
           </h2>
        </div>
        <div className="flex gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center gap-y-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map(d => (
          <span key={d} className="text-[10px] font-bold text-muted-foreground uppercase">{d}</span>
        ))}
        {renderDays()}
      </div>
    </div>
  );
}