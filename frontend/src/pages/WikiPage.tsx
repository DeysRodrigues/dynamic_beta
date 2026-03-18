import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Book, 
  Search, 
  Palette, 
  Keyboard, 
  Workflow, 
  ArrowLeft,
  ChevronRight,
  User,
  Heart,
  Rocket,
  Copyright,
  ArrowRight,
  Linkedin,
  Github,
  Sparkles,
  Zap
} from "lucide-react";
import SpotlightCard from "@/components/landing/SpotlightCard";
import ShinyText from "@/components/landing/ShinyText";
import ActionModal from "@/components/ui/ActionModal";

// --- TIPAGEM ---
interface WikiSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: "guia" | "sistema" | "comunidade";
  content: string;
  fullText?: string;
  details?: { label: string; desc: string }[];
  examples?: { trigger: string; action: string }[];
  tips?: string;
  curiosities?: string[];
  links?: { label: string; url: string; icon: React.ReactNode; color: string }[];
}

// --- DADOS DA WIKI ---
const WIKI_DATA: WikiSection[] = [
  {
    id: "intro",
    title: "O que é o Dyna?",
    category: "guia",
    icon: <Book size={18} />,
    content: "O Dynamic Notes (Dyna) é um sistema operacional de produtividade baseado em widgets. É um 'Segundo Cérebro' imersivo para organizar sua vida através de blocos funcionais.",
    fullText: "A filosofia do Dyna é a adaptação: o workspace deve mudar conforme seu humor e necessidade. Do foco extremo ao planejamento criativo, o Dyna é sua tela em branco tecnológica."
  },
  {
    id: "shortcuts",
    title: "Comandos de Elite",
    category: "guia",
    icon: <Keyboard size={18} />,
    content: "Acelere sua criação de tarefas usando o sistema de detecção automática (Parser) diretamente no campo 'Nova tarefa...'.",
    fullText: "Ao digitar na barra de entrada de tarefas, o Dyna identifica padrões específicos para configurar a tarefa instantaneamente sem que você precise clicar em menus.",
    details: [
      { label: ">HH:MM", desc: "Define horário de início. Ex: 'Reunião >14:00' ou 'Aula >15h'" },
      { label: ">>min", desc: "Define duração em minutos. Ex: 'Treino >>45' (configura 45min no timer)" },
      { label: "[tag]", desc: "Define a Tagzona. Ex: '[Trabalho] Enviar e-mail'" },
      { label: "!1, !2, !3", desc: "Níveis de prioridade: !1 (Alta/Vermelho), !2 (Média), !3 (Baixa)" },
      { label: "Ref: link", desc: "Adiciona uma URL de referência à tarefa automaticamente." }
    ],
    tips: "Exemplo Real: 'Codar Projeto >10:00 >>120 [Dev] !1' -> Cria uma tarefa para as 10h, com 2h de duração, na tag Dev e com alta prioridade."
  },
  {
    id: "automation",
    title: "Automação IF/THEN",
    category: "sistema",
    icon: <Workflow size={18} />,
    content: "O Dyna utiliza lógica de causa e efeito para tornar o ambiente reativo às suas ações.",
    examples: [
      { trigger: "Completar todas as tasks do dia", action: "Libera fogos de artifício na tela" },
      { trigger: "Timer Pomodoro finalizado", action: "Toca notificação e pisca a borda do widget" },
      { trigger: "Meta de hábitos atingida", action: "Muda a cor do widget para dourado" }
    ]
  },
  {
    id: "customization",
    title: "Customização Total",
    category: "guia",
    icon: <Palette size={18} />,
    content: "Cada pixel do Dyna pode ser seu. O design é focado em transparência e profundidade (Glassmorphism).",
    fullText: "No menu de Temas, você pode alterar o wallpaper (suporta PNG, JPG e GIFs), ajustar o 'Glass Blur' para controlar o desfoque, e a opacidade das caixas para criar um visual 'Cyberpunk' ou 'Minimalista'."
  },
  {
    id: "curiosities",
    title: "Curiosidades",
    category: "sistema",
    icon: <Sparkles size={18} />,
    content: "Coisas que você talvez não saiba sobre os bastidores do seu dashboard.",
    curiosities: [
      "O Dyna foi desenvolvido usando o próprio Dyna para gerenciar as tarefas de código.",
      "A opacidade das caixas afeta o consumo de GPU: menos transparência é melhor para PCs antigos.",
      "O sistema de cores utiliza 'color-mix' do CSS para gerar tons dinâmicos em tempo real.",
      "O nome 'Dynamic' surgiu porque o layout se move e se adapta como um organismo vivo.",
      "Existe um 'Modo Fantasma' escondido que remove todas as bordas do sistema (Modo Zen).",
      "O projeto começou como um simples bloco de notas e evoluiu para um SO de widgets em 3 meses."
    ]
  },
  {
    id: "creator",
    title: "Deys Rodrigues",
    category: "comunidade",
    icon: <User size={18} />,
    content: "Idealizadora, Designer e Desenvolvedora Fullstack do Dynamic Notes.",
    fullText: "Dey é uma entusiasta de tecnologia e design futurista que acredita que ferramentas de produtividade devem ser prazerosas de usar. Com o Dyna, ela uniu sua paixão por interfaces 'High-Tech' com a necessidade de um sistema de organização que não fosse burocrático.",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/deys-rodrigues/", icon: <Linkedin size={16} />, color: "bg-[#0077b5]" },
      { label: "GitHub", url: "https://github.com/deysrodrigues", icon: <Github size={16} />, color: "bg-[#24292e]" }
    ]
  },
  {
    id: "future",
    title: "O Futuro & Testers",
    category: "comunidade",
    icon: <Rocket size={18} />,
    content: "O Dyna está apenas começando. Queremos você na linha de frente.",
    fullText: "Estamos abrindo vagas para Beta Testers! Se você gosta de encontrar bugs e sugerir melhorias, entre em contato. Nosso Roadmap inclui um Marketplace de Widgets e Sincronização Mobile nativa.",
    tips: "Interessado em ser um Tester? Clique no botão de Comunidade abaixo!"
  },
  {
    id: "license",
    title: "Licença MIT",
    category: "sistema",
    icon: <Copyright size={18} />,
    content: "Projeto Open Source sob a licença MIT.",
    fullText: "O Dynamic Notes é software livre. Você pode baixar, modificar e distribuir, desde que mantenha os créditos da autora original. Acreditamos na construção coletiva e no livre acesso a ferramentas de qualidade."
  }
];

export default function WikiPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WikiSection["category"]>("guia");
  const [activeId, setActiveId] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtro de Busca
  const filteredItems = useMemo(() => {
    return WIKI_DATA.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeContent = useMemo(() => {
    return WIKI_DATA.find(i => i.id === activeId) || WIKI_DATA[0];
  }, [activeId]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans scroll-smooth flex flex-col">
      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        message="Ainda estamos desenvolvendo isso, humano! Mas a Dey está trabalhando duro!"
      />

      {/* Background Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[60%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Navbar Superior */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate("/intro")}
               className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
             >
               <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Book size={16} className="text-white" />
                </div>
                <span className="hidden sm:inline">Dyna Wiki</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="relative group hidden xs:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:border-blue-500/50 transition-all w-32 sm:w-48"
                />
             </div>
             <button 
                onClick={() => navigate("/")}
                className="px-4 py-1.5 bg-white text-black rounded-full font-bold text-xs hover:scale-105 transition-all shadow-lg"
             >
                Abrir App
             </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto relative z-10 overflow-hidden">
        
        {/* Sidebar de Navegação */}
        <aside className="w-full lg:w-[320px] p-6 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col gap-8 bg-black/20 backdrop-blur-sm lg:h-[calc(100vh-68px)] lg:sticky lg:top-[68px]">
          
          {/* Tabs de Categorias */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
             {(['guia', 'sistema', 'comunidade'] as const).map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                   activeTab === tab ? "bg-white/10 text-white shadow-sm" : "text-white/30 hover:text-white/60"
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>

          {/* Lista de Itens da Categoria */}
          <nav className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {filteredItems.filter(i => i.category === activeTab).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  activeId === item.id 
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className={`${activeId === item.id ? "text-blue-400" : "text-white/20 group-hover:text-white/60"}`}>
                    {item.icon}
                </span>
                {item.title}
                <ChevronRight size={14} className={`ml-auto transition-transform ${activeId === item.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} />
              </button>
            ))}
          </nav>

          {/* Card de Dica Rápida */}
          <div className="mt-auto hidden lg:block p-5 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 relative overflow-hidden group">
             <div className="relative z-10">
                <Zap size={18} className="text-yellow-400 mb-3 fill-yellow-400" />
                <p className="text-[10px] font-bold mb-1 opacity-50 uppercase tracking-tighter">Sabia que?</p>
                <p className="text-[11px] text-white/80 leading-relaxed font-medium">Você pode arrastar os widgets segurando em qualquer parte vazia deles!</p>
             </div>
             <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-white/10 transition-all" />
          </div>
        </aside>

        {/* Área de Conteúdo */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto lg:h-[calc(100vh-68px)] custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header da Seção */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10 shadow-inner group overflow-hidden relative">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:scale-150 transition-transform duration-700" />
                        <span className="relative z-10 scale-125">{activeContent.icon}</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                           <Sparkles size={10} /> {activeContent.category}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            <ShinyText text={activeContent.title} disabled={false} speed={3} />
                        </h1>
                    </div>
                </div>
                <p className="text-xl text-white/80 leading-relaxed font-medium">
                    {activeContent.content}
                </p>
            </div>

            <SpotlightCard className="bg-[#0a0a0a] border-white/5" spotlightColor="rgba(59, 130, 246, 0.1)">
                <div className="p-8 space-y-12">
                    {/* Texto Detalhado */}
                    {activeContent.fullText && (
                        <div className="text-lg text-white/50 leading-relaxed italic">
                            "{activeContent.fullText}"
                        </div>
                    )}

                    {/* Comandos / Detalhes Grid */}
                    {activeContent.details && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold opacity-30 uppercase tracking-widest ml-1">Sintaxe & Parâmetros</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activeContent.details.map((detail, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                        <div className="space-y-1">
                                            <span className="text-blue-400 font-mono text-xs font-bold bg-blue-500/10 px-2 py-0.5 rounded">{detail.label}</span>
                                            <p className="text-[11px] text-white/40 font-medium">{detail.desc}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-white/10 group-hover:text-blue-400 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Automações / Exemplos */}
                    {activeContent.examples && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold opacity-30 uppercase tracking-widest ml-1">Exemplos de Reatividade</h3>
                            <div className="space-y-3">
                                {activeContent.examples.map((ex, i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 border-l-blue-500 border-l-4 hover:bg-black/60 transition-colors">
                                        <div className="flex-1">
                                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Trigger (IF)</span>
                                            <p className="text-sm font-bold text-white/90">{ex.trigger}</p>
                                        </div>
                                        <div className="hidden md:block text-white/20">
                                            <ArrowRight size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[9px] font-bold text-blue-400/30 uppercase tracking-tighter">Response (THEN)</span>
                                            <p className="text-sm font-bold text-blue-400">{ex.action}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Curiosidades List */}
                    {activeContent.curiosities && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeContent.curiosities.map((c, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                                    <div className="text-2xl font-black text-white/5 absolute -top-2 -right-2 italic group-hover:text-blue-500/10 transition-colors">0{i+1}</div>
                                    <p className="text-sm text-white/60 leading-relaxed relative z-10">{c}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Links da Criadora */}
                    {activeContent.links && (
                        <div className="flex flex-wrap gap-4 pt-4">
                            {activeContent.links.map((link, i) => (
                                <a 
                                key={i} 
                                href={link.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 shadow-lg ${link.color}`}
                                >
                                    {link.icon} {link.label}
                                </a>
                            ))}
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-pink-600 text-white font-bold text-sm transition-all hover:scale-105 shadow-lg"
                            >
                                <Heart size={16} fill="white" /> Apoiar Projeto
                            </button>
                        </div>
                    )}
                </div>
            </SpotlightCard>

            {/* Dicas / Nota de Rodapé da Seção */}
            {activeContent.tips && (
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-4">
                    <Zap size={20} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-400/80 leading-relaxed italic">
                        <strong>Dica Expert:</strong> {activeContent.tips}
                    </p>
                </div>
            )}

            {/* Rodapé Interno da Wiki */}
            <footer className="pt-20 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30 hover:opacity-100 transition-opacity">
                <div className="text-[10px] font-bold tracking-widest uppercase">
                    Build 0.5.0 — Beta Phase
                </div>
                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <button onClick={() => setIsModalOpen(true)} className="hover:text-blue-400 transition">GitHub</button>
                    <button onClick={() => setIsModalOpen(true)} className="hover:text-blue-400 transition">Twitter</button>
                    <button onClick={() => setIsModalOpen(true)} className="hover:text-blue-400 transition">Discord</button>
                </div>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
