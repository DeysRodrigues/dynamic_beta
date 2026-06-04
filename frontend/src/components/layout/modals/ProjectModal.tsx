import { useState, useEffect } from "react";
import { X, Plus, Trash2, Briefcase, Repeat, Pencil, Check } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project, ProjectGoal, DailyRoutine } from "@/types/Project";
import { cn } from "@/lib/utils";
import { nativeWidgets } from "@/data/widgetItems";
import CustomDatePicker from "@/components/ui/CustomDatePicker";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const PROJECT_OVERVIEW_WIDGET = { id: "project_overview", title: "Visão Geral", icon: <Briefcase size={20} /> };

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
      const updatedGoals: ProjectGoal[] = goals.map(text => {
        const existing = projectToEdit.goals.find(g => g.text === text);
        return existing || { id: crypto.randomUUID(), text, completed: false };
      });

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
      <div 
        className="box-padrao w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden p-0 gap-0 border-none"
      >
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl shadow-inner">
              {projectToEdit ? <Pencil size={24} strokeWidth={2.5} /> : <Plus size={24} strokeWidth={2.5} />}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">{projectToEdit ? "Editar Projeto" : "Criar Novo Projeto"}</h2>
              <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Defina seus marcos e ferramentas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/10 rounded-xl transition-all opacity-40 hover:opacity-100">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-10 custom-scrollbar">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-1">Nome do Projeto</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Projeto Emagrecer"
                className="w-full bg-current/[0.06] border-none outline-none rounded-xl px-5 py-4 font-bold focus:bg-current/[0.1] transition-all text-current placeholder:opacity-20"
              />
            </div>
            
            <CustomDatePicker 
              label="Data de Início"
              value={startDate}
              onChange={setStartDate}
            />

            <CustomDatePicker 
              label="Data de Término"
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-1">Descrição do Objetivo</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que deseja alcançar..."
              className="w-full bg-current/[0.06] border-none outline-none rounded-xl px-5 py-4 font-bold focus:bg-current/[0.1] transition-all h-24 resize-none text-current placeholder:opacity-20"
            />
          </div>

          {/* Seleção de Widgets */}
          <div className="space-y-5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-1">Quais ferramentas deseja usar?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {/* Visão Geral (Sempre primeiro ou especial) */}
              <button
                onClick={() => toggleBox(PROJECT_OVERVIEW_WIDGET.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-none transition-all duration-300 group shadow-lg",
                  selectedBoxes.includes(PROJECT_OVERVIEW_WIDGET.id) 
                    ? "bg-primary text-primary-foreground scale-105" 
                    : "bg-current/[0.05] opacity-30 hover:opacity-100"
                )}
              >
                <Briefcase size={20} strokeWidth={selectedBoxes.includes(PROJECT_OVERVIEW_WIDGET.id) ? 3 : 2} />
                <span className="text-[9px] font-black uppercase tracking-widest text-center">{PROJECT_OVERVIEW_WIDGET.title}</span>
              </button>

              {nativeWidgets.map(box => (
                <button
                  key={box.id}
                  onClick={() => toggleBox(box.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-none transition-all duration-300 group shadow-lg",
                    selectedBoxes.includes(box.id) 
                      ? "bg-primary text-primary-foreground scale-105" 
                      : "bg-current/[0.05] opacity-30 hover:opacity-100"
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {box.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center line-clamp-1">{box.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Objetivos e Rotinas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Metas */}
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-1 flex items-center gap-2">
                <Briefcase size={14} /> Objetivos do Projeto
              </label>
              <div className="space-y-3">
                {goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-current/[0.03] p-4 rounded-xl group transition-all hover:bg-current/[0.06] shadow-sm">
                    <span className="text-xs font-bold flex-1">{goal}</span>
                    <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Adicionar nova meta..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newGoal && (setGoals([...goals, newGoal]), setNewGoal("")))}
                    className="flex-1 bg-current/[0.06] border-none outline-none rounded-xl px-4 py-3 text-xs font-bold text-current placeholder:opacity-20 focus:bg-current/[0.1]"
                  />
                  <button 
                    onClick={() => { if(newGoal) { setGoals([...goals, newGoal]); setNewGoal(""); } }}
                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            {/* Rotinas */}
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-1 flex items-center gap-2">
                <Repeat size={14} /> Rotinas Diárias
              </label>
              <div className="space-y-3">
                {routines.map((routine, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-current/[0.03] p-4 rounded-xl group transition-all hover:bg-current/[0.06] shadow-sm">
                    <span className="text-xs font-bold flex-1">{routine}</span>
                    <button onClick={() => setRoutines(routines.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newRoutine}
                    onChange={(e) => setNewRoutine(e.target.value)}
                    placeholder="Adicionar nova rotina..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newRoutine && (setRoutines([...routines, newRoutine]), setNewRoutine("")))}
                    className="flex-1 bg-current/[0.06] border-none outline-none rounded-xl px-4 py-3 text-xs font-bold text-current placeholder:opacity-20 focus:bg-current/[0.1]"
                  />
                  <button 
                    onClick={() => { if(newRoutine) { setRoutines([...routines, newRoutine]); setNewRoutine(""); } }}
                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] opacity-30 hover:opacity-100 hover:bg-current/5 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-primary/30"
          >
            <Check size={18} strokeWidth={4} /> {projectToEdit ? "Salvar Projeto" : "Confirmar Projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}
