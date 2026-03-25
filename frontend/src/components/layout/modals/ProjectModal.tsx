import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Target, Repeat, Pencil } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project, ProjectGoal, DailyRoutine } from "@/types/Project";
import { cn } from "@/lib/utils";
import { nativeWidgets } from "@/data/widgetItems";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const PROJECT_OVERVIEW_WIDGET = { id: "project_overview", title: "Visão Geral", icon: <Target size={20} /> };

export default function ProjectModal({ isOpen, onClose, projectToEdit }: ProjectModalProps) {
  const { addProject, updateProject } = useProjectStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>(["project_overview", "tasks"]);
  
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  
  const [routines, setRoutines] = useState<string[]>([]);
  const [newRoutine, setNewRoutine] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setSelectedBoxes(["project_overview", "tasks"]);
    setGoals([]);
    setRoutines([]);
  };

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStartDate(projectToEdit.startDate || "");
      setEndDate(projectToEdit.endDate || "");
      // Extrair tipos dos widgets existentes (ex: "tasks-123" -> "tasks")
      setSelectedBoxes(projectToEdit.boxes.map(id => id.split("-")[0]));
      setGoals(projectToEdit.goals.map(g => g.text));
      setRoutines(projectToEdit.routines.map(r => r.text));
    } else {
      resetForm();
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return alert("Nome é obrigatório");

    if (projectToEdit) {
      // Mesclar Objetivos: Preserva os que já existem, adiciona novos
      const updatedGoals: ProjectGoal[] = goals.map(text => {
        const existing = projectToEdit.goals.find(g => g.text === text);
        return existing || { id: crypto.randomUUID(), text, completed: false };
      });

      // Mesclar Rotinas: Preserva as que já existem
      const updatedRoutines: DailyRoutine[] = routines.map(text => {
        const existing = projectToEdit.routines.find(r => r.text === text);
        return existing || { id: crypto.randomUUID(), text, completedDates: [] };
      });

      const updatedBoxes = selectedBoxes.map(type => {
        const existingBox = projectToEdit.boxes.find(id => id.startsWith(`${type}-`));
        return existingBox || `${type}-${crypto.randomUUID().slice(0, 8)}`;
      });

      updateProject(projectToEdit.id, {
        name,
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        boxes: updatedBoxes,
        goals: updatedGoals,
        routines: updatedRoutines,
      });
    } else {
      const projectGoals: ProjectGoal[] = goals.map(g => ({
        id: crypto.randomUUID(),
        text: g,
        completed: false
      }));

      const projectRoutines: DailyRoutine[] = routines.map(r => ({
        id: crypto.randomUUID(),
        text: r,
        completedDates: []
      }));

      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        layouts: { lg: [], md: [], sm: [] },
        boxes: selectedBoxes.map(type => `${type}-${crypto.randomUUID().slice(0, 8)}`),
        goals: projectGoals,
        routines: projectRoutines,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      addProject(newProject);
    }

    onClose();
    resetForm();
  };

  const toggleBox = (id: string) => {
    setSelectedBoxes(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
      <div className="bg-[var(--box-color)] text-[var(--box-text-color)] w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-current/10 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 flex items-center justify-between border-b border-current/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              {projectToEdit ? <Pencil size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">{projectToEdit ? "Editar Projeto" : "Criar Novo Projeto"}</h2>
              <p className="opacity-50 text-xs font-bold uppercase tracking-widest mt-1">Defina seus marcos e ferramentas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-current/10 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Nome do Projeto</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Projeto Emagrecer"
                className="w-full bg-current/5 border-none outline-none rounded-2xl px-5 py-4 font-bold focus:ring-2 ring-primary/50 transition-all text-current placeholder:opacity-30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Data de Início (Opcional)</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-current/5 border-none outline-none rounded-2xl px-5 py-4 font-bold focus:ring-2 ring-primary/50 transition-all text-current"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Data de Término (Opcional)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-current/5 border-none outline-none rounded-2xl px-5 py-4 font-bold focus:ring-2 ring-primary/50 transition-all text-current"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Descrição</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que deseja alcançar..."
              className="w-full bg-current/5 border-none outline-none rounded-2xl px-5 py-4 font-bold focus:ring-2 ring-primary/50 transition-all h-20 resize-none text-current placeholder:opacity-30"
            />
          </div>

          {/* Seleção de Widgets */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 text-current">Quais ferramentas deseja usar?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {/* Visão Geral (Sempre primeiro ou especial) */}
              <button
                onClick={() => toggleBox(PROJECT_OVERVIEW_WIDGET.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                  selectedBoxes.includes(PROJECT_OVERVIEW_WIDGET.id) 
                    ? "bg-primary/10 border-primary text-primary" 
                    : "bg-current/5 border-transparent opacity-40 hover:opacity-100"
                )}
              >
                {PROJECT_OVERVIEW_WIDGET.icon}
                <span className="text-[10px] font-black uppercase tracking-tighter text-center">{PROJECT_OVERVIEW_WIDGET.title}</span>
              </button>

              {nativeWidgets.map(box => (
                <button
                  key={box.id}
                  onClick={() => toggleBox(box.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                    selectedBoxes.includes(box.id) 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-current/5 border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {box.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-center line-clamp-1">{box.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Objetivos e Rotinas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Metas */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 flex items-center gap-2 text-current">
                <Target size={14} /> Objetivos do Projeto
              </label>
              <div className="space-y-2">
                {goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-current/5 p-3 rounded-xl group text-current">
                    <span className="text-xs font-bold flex-1">{goal}</span>
                    <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Nova meta..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newGoal && (setGoals([...goals, newGoal]), setNewGoal("")))}
                    className="flex-1 bg-current/5 border-none outline-none rounded-xl px-4 py-2 text-xs font-bold text-current placeholder:opacity-30"
                  />
                  <button 
                    onClick={() => { if(newGoal) { setGoals([...goals, newGoal]); setNewGoal(""); } }}
                    className="p-2 bg-current/10 rounded-xl hover:bg-primary hover:text-white transition-all text-current"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Rotinas */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 flex items-center gap-2 text-current">
                <Repeat size={14} /> Rotinas Diárias
              </label>
              <div className="space-y-2">
                {routines.map((routine, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-current/5 p-3 rounded-xl group text-current">
                    <span className="text-xs font-bold flex-1">{routine}</span>
                    <button onClick={() => setRoutines(routines.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newRoutine}
                    onChange={(e) => setNewRoutine(e.target.value)}
                    placeholder="Nova rotina..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newRoutine && (setRoutines([...routines, newRoutine]), setNewRoutine("")))}
                    className="flex-1 bg-current/5 border-none outline-none rounded-xl px-4 py-2 text-xs font-bold text-current placeholder:opacity-30"
                  />
                  <button 
                    onClick={() => { if(newRoutine) { setRoutines([...routines, newRoutine]); setNewRoutine(""); } }}
                    className="p-2 bg-current/10 rounded-xl hover:bg-primary hover:text-white transition-all text-current"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-current/5 bg-current/[0.02] flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-current/5 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Save size={20} /> {projectToEdit ? "Salvar Alterações" : "Criar Projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}

