import React, { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { CheckCircle2, Circle, Calendar, Target, Repeat, Trash2, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO } from "date-fns";

interface ProjectOverviewBoxProps {
  projectId: string;
}

export default function ProjectOverviewBox({ projectId }: ProjectOverviewBoxProps) {
  const { projects, toggleGoal, toggleRoutine, addGoal, addRoutine, removeGoal, removeRoutine } = useProjectStore();
  const project = projects.find((p) => p.id === projectId);

  const [newGoal, setNewGoal] = useState("");
  const [newRoutine, setNewRoutine] = useState("");

  if (!project) return null;

  const today = format(new Date(), "yyyy-MM-dd");
  const daysRemaining = project.endDate 
    ? differenceInDays(parseISO(project.endDate), new Date()) 
    : null;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addGoal(projectId, newGoal.trim());
      setNewGoal("");
    }
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoutine.trim()) {
      addRoutine(projectId, newRoutine.trim());
      setNewRoutine("");
    }
  };

  return (
    <div className="box-padrao">
      {/* Header do Projeto */}
      <div className="mb-4">
        <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
          <Target className="text-primary" size={20} />
          {project.name}
        </h3>
        <p className="text-xs opacity-60 line-clamp-2 mt-1">{project.description}</p>
        
        {project.startDate && (
          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold uppercase opacity-80 bg-primary/10 w-fit px-2 py-1 rounded-lg">
            <Clock size={12} />
            Início: {format(parseISO(project.startDate), "dd/MM/yyyy")}
          </div>
        )}
        
        {project.endDate && (
          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold uppercase opacity-80 bg-primary/10 w-fit px-2 py-1 rounded-lg">
            <Calendar size={12} />
            Termina em: {format(parseISO(project.endDate), "dd/MM/yyyy")} 
            <span className="ml-1 text-primary">
              ({daysRemaining! > 0 ? `${daysRemaining} dias restantes` : "Encerrado"})
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {/* Objetivos */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
              <Target size={12} /> Objetivos
            </h4>
          </div>
          <div className="space-y-1">
            {(project.goals || []).map((goal) => (
              <div key={goal.id} className="group flex items-center gap-2 bg-current/5 p-2 rounded-xl transition-all hover:bg-current/10">
                <button onClick={() => toggleGoal(projectId, goal.id)} className="shrink-0">
                  {goal.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Circle size={18} className="opacity-30 hover:opacity-100" />
                  )}
                </button>
                <span className={cn("text-xs font-medium flex-1", goal.completed && "line-through opacity-40")}>
                  {goal.text}
                </span>
                <button 
                  onClick={() => removeGoal(projectId, goal.id)}
                  className="opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <form onSubmit={handleAddGoal} className="flex items-center gap-2 mt-2">
              <input 
                type="text" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Novo objetivo..."
                className="bg-current/5 border-none outline-none rounded-lg px-3 py-1.5 text-xs flex-1"
              />
              <button type="submit" className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform">
                <Plus size={16} />
              </button>
            </form>
          </div>
        </section>

        {/* Rotinas Diárias */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
              <Repeat size={12} /> Rotinas Diárias
            </h4>
          </div>
          <div className="space-y-1">
            {(project.routines || []).map((routine) => {
              const isCompletedToday = routine.completedDates?.includes(today);
              return (
                <div key={routine.id} className="group flex items-center gap-2 bg-current/5 p-2 rounded-xl transition-all hover:bg-current/10">
                  <button onClick={() => toggleRoutine(projectId, routine.id, today)} className="shrink-0">
                    {isCompletedToday ? (
                      <CheckCircle2 size={18} className="text-primary" />
                    ) : (
                      <Circle size={18} className="opacity-30 hover:opacity-100" />
                    )}
                  </button>
                  <span className={cn("text-xs font-medium flex-1", isCompletedToday && "opacity-60")}>
                    {routine.text}
                  </span>
                  <button 
                    onClick={() => removeRoutine(projectId, routine.id)}
                    className="opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            <form onSubmit={handleAddRoutine} className="flex items-center gap-2 mt-2">
              <input 
                type="text" 
                value={newRoutine}
                onChange={(e) => setNewRoutine(e.target.value)}
                placeholder="Nova rotina..."
                className="bg-current/5 border-none outline-none rounded-lg px-3 py-1.5 text-xs flex-1"
              />
              <button type="submit" className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform">
                <Plus size={16} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
