import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Plus, Target, Trash2, ExternalLink, CheckCircle2, Clock, Pencil, Sparkles, LayoutGrid } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import ProjectModal from "@/components/layout/modals/ProjectModal";
import type { Project } from "@/types/Project";
import ShinyText from "@/components/landing/ShinyText";

export default function ProjectsPage() {
  const { projects, deleteProject, setActiveProject } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const navigate = useNavigate();

  const handleOpenProject = (id: string) => {
    setActiveProject(id);
    navigate("/");
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleNewProject = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-transparent animate-in fade-in duration-500">
      {/* Background Ambient (Dinâmico com o Tema) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-6xl space-y-8 pt-10 pb-20 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border shrink-0 transition-colors duration-500"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                    color: 'var(--primary)'
                 }}>
               <Target size={28} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 opacity-60"
                   style={{ color: 'var(--primary)' }}>
                 <Sparkles size={10} /> Gestão de Projetos
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                  <ShinyText text="Meus Projetos" disabled={false} speed={3} />
              </h1>
            </div>
          </div>

          <button
            onClick={handleNewProject}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Plus size={18} strokeWidth={3} /> Novo Projeto
          </button>
        </div>

        {/* --- GRID DE PROJETOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center box-padrao opacity-40 border-dashed border-2 bg-transparent">
              <div className="p-6 bg-current/5 rounded-full mb-6">
                <LayoutGrid size={48} className="opacity-20" />
              </div>
              <p className="font-black uppercase tracking-widest text-sm">Nenhum projeto encontrado</p>
              <button 
                onClick={handleNewProject}
                className="mt-4 text-xs font-bold underline opacity-60 hover:opacity-100 transition-opacity"
              >
                Criar meu primeiro projeto agora
              </button>
            </div>
          )}

          {projects.map((project) => {
            const completedGoals = (project.goals || []).filter(g => g.completed).length;
            const totalGoals = (project.goals || []).length;
            const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

            return (
              <div 
                key={project.id}
                className="group relative box-padrao border border-current/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-visible"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <Target size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditProject(project)}
                      className="p-2 opacity-20 group-hover:opacity-60 hover:opacity-100 hover:text-primary transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => { if(confirm("Deseja realmente excluir este projeto?")) deleteProject(project.id) }}
                      className="p-2 opacity-20 group-hover:opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black tracking-tighter mb-2 truncate uppercase">{project.name}</h3>
                <p className="text-xs font-medium opacity-50 line-clamp-2 mb-8 h-8 leading-relaxed">{project.description}</p>

                <div className="space-y-6">
                  {/* Barra de Progresso */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                      <span>Progresso</span>
                      <span className="text-primary opacity-100">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-current/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                        <CheckCircle2 size={12} className="text-primary" /> 
                        <span>{completedGoals}/{totalGoals} Metas</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-current/5">
                      <div className="flex flex-wrap gap-4 w-full">
                        {project.startDate && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider opacity-40">
                            <Clock size={10} /> {format(parseISO(project.startDate), "dd MMM yy", { locale: ptBR })}
                          </div>
                        )}
                        {project.endDate && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider opacity-40 ml-auto">
                            <Clock size={10} /> {format(parseISO(project.endDate), "dd MMM yy", { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenProject(project.id)}
                    className="w-full py-4 bg-current/5 hover:bg-primary hover:text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn overflow-hidden relative shadow-lg shadow-black/5"
                  >
                    <span className="relative z-10">Abrir Dashboard</span>
                    <ExternalLink size={14} className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={projectToEdit}
      />
    </div>
  );
}

