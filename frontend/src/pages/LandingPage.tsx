import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Star,
  Palette,
  Layout,
  Zap,
  ChevronRight,
  ChevronLeft,
  Brush,
  Monitor,
  Keyboard,
  Workflow,
  Code2,
} from "lucide-react";
import SpotlightCard from "@/components/landing/SpotlightCard";
import ShinyText from "@/components/landing/ShinyText";

// --- DADOS PARA O CARROSSEL ---
const HERO_SLIDES = [
  {
    id: 1,
    image: "/images-themes/dashboard-preview.png",
    title: "Seu Espaço, Suas Regras",
    subtitle: "Um OS de produtividade completo rodando no seu navegador.",
  },
  {
    id: 2,
    image: "/images-themes/gallery-preview.png",
    title: "Galeria de Temas",
    subtitle: "Escolha entre dezenas de estilos ou crie o seu próprio.",
  },
  {
    id: 3,
    image: "/images-themes/image.png",
    title: "Imersão Total",
    subtitle: "Papéis de parede dinâmicos e cores que se adaptam.",
  },
];

// --- CORES FAMOSAS ---
const COLOR_PALETTES = [
  { name: "Dracula", color: "#bd93f9", bg: "#282a36" },
  { name: "Nord", color: "#88c0d0", bg: "#2e3440" },
  { name: "Catppuccin", color: "#cba6f7", bg: "#1e1e2e" },
  { name: "Monokai", color: "#f92672", bg: "#272822" },
  { name: "Gruvbox", color: "#fabd2f", bg: "#282828" },
  { name: "Rose Pine", color: "#ebbcba", bg: "#191724" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play Carrossel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans scroll-smooth">
      {/* Background Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-black to-transparent z-10" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Star size={16} className="text-white fill-white" />
          </div>
          Dynamic Notes
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-200 rounded-full transition-all"
        >
          Entrar
        </button>
      </nav>

      {/* ================================================================================= */}
      {/* 1. SEÇÃO INTUITO (MANIFESTO) */}
      {/* ================================================================================= */}
      <section className="relative z-10 pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/60 mb-4 hover:bg-white/10 transition cursor-default">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            A produtividade ficou bonita.
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.1]">
            Transforme o Caos <br />
            em <ShinyText text="Arte." className="text-purple-400" speed={5} />
          </h1>

          <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            O Dynamic Notes não é apenas uma lista de tarefas. É um{" "}
            <strong>espaço vivo</strong> que une foco, estética e gamificação
            para tornar seu trabalho gratificante.
          </p>

          <div className="flex justify-center gap-6 pt-4">
            <button
              onClick={() => navigate("/")}
              className="group px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              Criar meu Espaço{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================================= */}
      {/* 2. HERO CAROUSEL (APRESENTAÇÃO) */}
      {/* ================================================================================= */}
      <section className="relative z-10 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* O CARROSSEL */}
          <div className="relative w-full aspect-video md:h-[600px] perspective-1000 group">
            <div className="relative w-full h-full bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-700 ease-out hover:scale-[1.01]">
              {/* Header do Mockup */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-[#1a1a1a]/90 backdrop-blur border-b border-white/5 flex items-center px-4 gap-2 z-20">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 px-3 py-1 bg-black/50 rounded-md text-[10px] text-white/30 font-mono flex-1 text-center">
                  dynamic-notes.app
                </div>
              </div>

              {/* Slides */}
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 top-10 transition-opacity duration-1000 ${
                    index === currentSlide
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-top opacity-90"
                  />

                  {/* Legenda Flutuante */}
                  <div className="absolute bottom-8 left-8 px-6 py-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-left shadow-2xl max-w-sm">
                    <h3 className="font-bold text-white text-lg mb-1">
                      {slide.title}
                    </h3>
                    <p className="text-white/60 text-sm">{slide.subtitle}</p>
                    <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 animate-[loading_6s_linear_infinite]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles */}
            <button
              onClick={() =>
                setCurrentSlide(
                  (p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                )
              }
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 text-white transition md:flex hidden hover:scale-110"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length)
              }
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 text-white transition md:flex hidden hover:scale-110"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================================= */}
      {/* 3. RECURSOS AVANÇADOS (POWER FEATURES) */}
      {/* ================================================================================= */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Para quem leva a sério
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto">
              Recursos avançados para Power Users. O controle total nas suas
              mãos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FEATURE 1: SINTAXE INTELIGENTE */}
            <SpotlightCard
              className="h-auto bg-[#111]"
              spotlightColor="rgba(168, 85, 247, 0.2)"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Keyboard size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Sintaxe de Comando</h3>
                <p className="text-sm text-white/50 mb-6">
                  Escreva tarefas na velocidade do pensamento. Use códigos
                  simples para definir tudo em uma linha.
                </p>
                <div className="mt-auto bg-black/50 rounded-lg p-4 font-mono text-xs border border-white/10 space-y-3">
                  <div className="flex gap-2 items-center text-white/40">
                    <span>$</span>
                    <span className="text-white">
                      - Estudar React{" "}
                      <span className="text-blue-400">&gt;2h</span>{" "}
                      <span className="text-yellow-400">&gt;&gt;14:00</span>{" "}
                      <span className="text-green-400">[Dev]</span>
                    </span>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* FEATURE 2: AUTOMAÇÃO */}
            <SpotlightCard
              className="h-auto bg-[#111]"
              spotlightColor="rgba(234, 179, 8, 0.2)"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6 text-yellow-400">
                  <Workflow size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Automação (IF/THEN)</h3>
                <p className="text-sm text-white/50 mb-6">
                  Crie regras de causa e efeito. "Se eu completar 5 tarefas,
                  toque uma música de vitória".
                </p>
                <div className="mt-auto space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-yellow-500 font-bold">IF</span>{" "}
                    <span className="text-white/70">Tasks &gt; 5</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-green-500 font-bold">THEN</span>{" "}
                    <span className="text-white/70">Play Sound</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* FEATURE 3: CUSTOM WIDGETS */}
            <SpotlightCard
              className="h-auto bg-[#111]"
              spotlightColor="rgba(59, 130, 246, 0.2)"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                  <Code2 size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Dev Mode & Embeds</h3>
                <p className="text-sm text-white/50 mb-6">
                  Não encontrou o widget perfeito? Crie o seu com HTML/CSS ou
                  cole qualquer iframe (Spotify, YouTube).
                </p>
                <div className="mt-auto relative group overflow-hidden rounded-lg border border-blue-500/30">
                  <div className="absolute inset-0 bg-blue-500/10 z-0" />
                  <div className="p-3 font-mono text-[10px] text-blue-200 relative z-10">
                    &lt;div&gt;Meu Widget&lt;/div&gt;
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ================================================================================= */}
      {/* 4. PALETAS DE CORES */}
      {/* ================================================================================= */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-pink-400 font-bold tracking-widest text-xs uppercase">
            <Palette size={16} /> Color Science
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            As Cores que você <br />{" "}
            <span className="text-white/20 line-through decoration-pink-500">
              Conhece.
            </span>{" "}
            <span className="text-pink-400">Ama.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-16">
            Dracula, Nord, Monokai... Já incluímos as paletas mais famosas do
            mundo dev.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {COLOR_PALETTES.map((theme) => (
              <div key={theme.name} className="group relative cursor-default">
                <div
                  className="h-32 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 transition-all duration-300 group-hover:scale-105 group-hover:border-white/20 shadow-xl"
                  style={{ backgroundColor: theme.bg }}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-lg ring-4 ring-black/20"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-xs font-bold text-white/70">
                    {theme.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-colors">
            <div className="text-left">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Brush size={20} className="text-pink-400" /> Crie do Zero
              </h3>
              <p className="text-sm text-white/50 mt-1">
                Envie wallpapers, escolha cores Hex/RGB e ajuste opacidade.
              </p>
            </div>
            <button
              onClick={() => navigate("/themes")}
              className="px-6 py-3 bg-white text-black rounded-lg font-bold text-sm hover:scale-105 transition-transform"
            >
              Abrir Editor de Temas
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================================= */}
      {/* 5. ATIVIDADES & DISPOSITIVOS */}
      {/* ================================================================================= */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Planeje para <br />{" "}
              <span className="text-blue-400">Qualquer Momento.</span>
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Layouts Salvos</h3>
                  <p className="text-white/50 text-sm mt-1">
                    Crie um layout "Trabalho" e outro "Gaming". Troque entre
                    eles com um clique.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Responsividade Real</h3>
                  <p className="text-white/50 text-sm mt-1">
                    Funciona no seu monitor Ultrawide, no laptop e em telas
                    menores.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Foco Direcionado</h3>
                  <p className="text-white/50 text-sm mt-1">
                    Use o "Modo Zen" para esconder tudo e manter apenas o
                    essencial na tela.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] w-full bg-gradient-to-tr from-blue-900/20 to-purple-900/20 rounded-3xl border border-white/10 p-8 flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
            <div className="relative z-10 w-64 h-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl transform group-hover:rotate-3 transition duration-700">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-white/40">
                  CURRENT MODE
                </span>
                <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">
                  ACTIVE
                </div>
              </div>
              <div className="text-center mt-10">
                <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center">
                  <Layout size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold">Deep Work</h3>
                <p className="text-sm text-white/50 mt-2">
                  Notificações pausadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="relative z-10 py-32 px-6 text-center border-t border-white/5 bg-black">
        <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tighter">
          Seu{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Segundo Cérebro
          </span>{" "}
          <br /> está pronto.
        </h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-300"
          >
            Começar Grátis
          </button>
        </div>
        <div className="mt-16 flex justify-center gap-8 text-white/30 text-sm">
          <span>© 2025 Dynamic Notes</span>
          <span className="hover:text-white cursor-pointer transition">
            Privacidade
          </span>
          <span className="hover:text-white cursor-pointer transition">
            Termos
          </span>
          <span className="hover:text-white cursor-pointer transition">
            Twitter
          </span>
        </div>
      </footer>
    </div>
  );
}
