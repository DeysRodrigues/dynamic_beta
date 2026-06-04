import { CheckCircle2, Circle, ListTodo, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    rate: number;
  };
  filter: "all" | "pending" | "completed";
  setFilter: (filter: "all" | "pending" | "completed") => void;
}

export function WeekStats({ stats, filter, setFilter }: WeekStatsProps) {
  const cards = [
    { label: "Total", value: stats.total, icon: ListTodo, type: "all" },
    { label: "Pendentes", value: stats.pending, icon: Circle, type: "pending" },
    { label: "Concluídas", value: stats.completed, icon: CheckCircle2, type: "completed" },
    { label: "Taxa", value: `${stats.rate}%`, icon: TrendingUp, type: null },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {cards.map((card, i) => {
        const isClickable = card.type !== null;
        const isActive = filter === card.type;

        return (
          <div
            key={i}
            onClick={() => isClickable && setFilter(card.type as "all" | "pending" | "completed")}
            className={cn(
              "p-4 rounded-2xl bg-current/[0.03] flex flex-col gap-1 transition-all",
              isClickable ? "cursor-pointer hover:bg-current/[0.06]" : "",
              isActive ? "ring-2 ring-primary bg-primary/5" : ""
            )}
          >
            <div className="flex items-center justify-between opacity-40">
              <span className="text-[10px] font-black uppercase tracking-widest">{card.label}</span>
              <card.icon size={14} />
            </div>
            <span className="text-xl font-black">{card.value}</span>
          </div>
        );
      })}
    </div>
  );
}
