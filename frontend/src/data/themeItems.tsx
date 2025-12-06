import { Snowflake, Cat, Ghost, Anchor, Leaf, Fish, Sprout, MonitorPlay } from "lucide-react";

// =====================================================================
// 1. PALETAS DE CORES (Só muda as cores, mantém wallpaper atual)
// =====================================================================
export const colorPalettes = [
  {
    id: "palette-default",
    name: "Classic Indigo",
    description: "O tema padrão, limpo e profissional.",
    theme: {
      backgroundColor: "#f9fafb",
      boxColor: "#ffffff",
      sidebarColor: "hsl(222.2 47.4% 11.2%)",
      textColor: "#1e293b",
      primaryColor: "#616EFF",
      boxOpacity: 1,
    }
  },
  {
    id: "palette-dracula",
    name: "Dracula",
    description: "Vampiro moderno. Roxo vibrante e fundo escuro.",
    theme: {
      backgroundColor: "#282a36",
      boxColor: "#44475a",
      sidebarColor: "#282a36",
      textColor: "#f8f8f2",
      primaryColor: "#bd93f9",
      boxOpacity: 1,
    },
  },
  {
    id: "palette-nord",
    name: "Nord",
    description: "Ártico, frio e elegante. Tons de azul acinzentado.",
    theme: {
      backgroundColor: "#2e3440",
      boxColor: "#3b4252",
      sidebarColor: "#242933",
      textColor: "#d8dee9",
      primaryColor: "#88c0d0",
      boxOpacity: 1,
    },
  },
  {
    id: "palette-catppuccin",
    name: "Catppuccin",
    description: "Tons pastéis suaves e muito agradáveis.",
    theme: {
      backgroundColor: "#1e1e2e",
      boxColor: "#313244",
      sidebarColor: "#181825",
      textColor: "#cdd6f4",
      primaryColor: "#cba6f7",
      boxOpacity: 1,
    },
  },
  {
    id: "palette-solarized",
    name: "Solarized",
    description: "Contraste preciso para conforto ocular.",
    theme: {
      backgroundColor: "#002b36",
      boxColor: "#073642",
      sidebarColor: "#00212b",
      textColor: "#839496",
      primaryColor: "#2aa198",
      boxOpacity: 1,
    },
  },
  {
    id: "palette-monokai",
    name: "Monokai Pro",
    description: "Vibrante e energético. Clássico dos editores.",
    theme: {
      backgroundColor: "#272822",
      boxColor: "#3e3d32",
      sidebarColor: "#1e1f1c",
      textColor: "#f8f8f2",
      primaryColor: "#f92672",
      boxOpacity: 1,
    },
  },
  {
    id: "palette-gruvbox",
    name: "Gruvbox Dark",
    description: "Retrô, contraste médio e tons quentes.",
    theme: {
      backgroundColor: "#282828",
      boxColor: "#3c3836",
      sidebarColor: "#1d2021",
      textColor: "#ebdbb2",
      primaryColor: "#fabd2f",
      boxOpacity: 1,
    },
  },
];

// =====================================================================
// 2. TEMAS DE IMERSÃO (Muda Cores + Papel de Parede, mantém Layout)
// =====================================================================
export const wallpaperThemes = [
 

// =====================================================================
  // PACOTE ESPECIAL: HOMENAGEM & GATINHOS
  // =====================================================================
  
  {
    id: "theme-cat-love",
    name: "Amor Eterno", // Homenagem delicada
    description: "Um entardecer suave e romântico. Para momentos de paz a dois. (for u, c sz)",
    previewColor: "bg-[#8b5cf6]", // Roxo Suave
    theme: {
      backgroundColor: "#2e2a45", // Azul/Roxo Crepúsculo (Fundo do céu)
      boxColor: "#3e3859",        // Roxo levemente mais claro para caixas
      sidebarColor: "#1e1b2e",    // Escuro aconchegante
      textColor: "#e9d5ff",       // Lilás claro (Texto legível)
      primaryColor: "#f472b6",    // Rosa Suave (Cor das nuvens/flores e do amor)
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/cat-love.png", // Renomeie image_341ddc
    },
  },
  {
    id: "theme-cat-pile",
    name: "Cuddle Puddle",
    description: "Uma pilha de fofura. Tons terrosos, beges e muito aconchego.",
    previewColor: "bg-[#d4a373]", // Bege/Marrom
    theme: {
      backgroundColor: "#f5ebe0", // Creme claro
      boxColor: "#e3d5ca",        // Latte suave
      sidebarColor: "#4a403a",    // Marrom Café
      textColor: "#3e2723",       // Marrom Escuro
      primaryColor: "#d4a373",    // Caramelo
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/cat-pile.png", // Renomeie image_342143
    },
  },

  // =====================================================================
  // PACOTE HOLLOW KNIGHT (Silksong & Abyss)
  // =====================================================================

  {
    id: "theme-hollow-garden",
    name: "Hornet's Garden",
    description: "Tons pastéis oníricos. Azul, ciano e o rosa vibrante das flores.",
    previewColor: "bg-[#60a5fa]", // Azul Pastel
    theme: {
      backgroundColor: "#dbeafe", // Azul Bebê muito claro
      boxColor: "#bfdbfe",        // Azul Céu Translucido
      sidebarColor: "#1e3a8a",    // Azul Real Escuro
      textColor: "#172554",       // Azul Profundo
      primaryColor: "#fb7185",    // Rosa Flor (Destaque da Hornet)
      boxOpacity: 0.8,
      wallpaper: "custom",
      customImage: "/images-themes/hollow-garden.png", // Renomeie image_348731
    },
  },
  {
    id: "theme-hollow-silk",
    name: "Silksong Duel",
    description: "Ação dinâmica com tons profundos de violeta e brilhos de seda.",
    previewColor: "bg-[#c026d3]", // Fuchsia
    theme: {
      backgroundColor: "#2e1065", // Violeta Profundo
      boxColor: "#4c1d95",        // Roxo Intenso
      sidebarColor: "#1c1917",    // Quase preto
      textColor: "#f5d0fe",       // Rosa Pálido Brilhante
      primaryColor: "#e879f9",    // Rosa Seda Neon
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/hollow-silk.png", // Renomeie image_348752
    },
  },
  {
    id: "theme-hollow-abyss",
    name: "Abyssal Light",
    description: "O brilho azul do Lifeblood na escuridão do abismo.",
    previewColor: "bg-[#22d3ee]", // Ciano
    theme: {
      backgroundColor: "#020617", // Preto Azulado
      boxColor: "#0f172a",        // Slate Escuro
      sidebarColor: "#020617",    // Preto
      textColor: "#bae6fd",       // Azul Gelo
      primaryColor: "#22d3ee",    // Ciano Lifeblood Brilhante
      boxOpacity: 0.8,
      wallpaper: "custom",
      customImage: "/images-themes/hollow-abyss.png", // Renomeie image_348778
    },
  },

  // =====================================================================
  // PACOTE FRUITS (Refrescante)
  // =====================================================================

  {
    id: "theme-fruit-cherry",
    name: "Sky Cherries",
    description: "Céu de anime azul vibrante com o vermelho intenso das cerejas.",
    previewColor: "bg-[#ef4444]", // Vermelho
    theme: {
      backgroundColor: "#e0f2fe", // Azul Céu Claro
      boxColor: "#ffffff",        // Branco Limpo
      sidebarColor: "#0c4a6e",    // Azul Petróleo
      textColor: "#075985",       // Azul Escuro
      primaryColor: "#dc2626",    // Vermelho Cereja
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/fruit-cherry.png", // Renomeie image_348f37
    },
  },
  {
    id: "theme-fruit-citrus",
    name: "Citrus Sparkle",
    description: "Refrescante, líquido e energizante. Laranja e dourado.",
    previewColor: "bg-[#f97316]", // Laranja
    theme: {
      backgroundColor: "#ffedd5", // Laranja muito pálido
      boxColor: "#fff7ed",        // Branco quente
      sidebarColor: "#7c2d12",    // Marrom Avermelhado
      textColor: "#431407",       // Marrom Café
      primaryColor: "#ea580c",    // Laranja Vivo
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/fruit-citrus.png", // Renomeie image_34923b
    },
  },
  {
    id: "theme-fruit-blue",
    name: "Blueberry Splash",
    description: "Água cristalina e mirtilos. Frio, calmo e focado.",
    previewColor: "bg-[#3b82f6]", // Azul Real
    theme: {
      backgroundColor: "#eff6ff", // Azul Água
      boxColor: "#dbeafe",        // Azul Gelo Transparente
      sidebarColor: "#172554",    // Azul Profundo
      textColor: "#1e40af",       // Azul Escuro
      primaryColor: "#2563eb",    // Azul Vibrante
      boxOpacity: 0.8,
      wallpaper: "custom",
      customImage: "/images-themes/fruit-blueberry.png", // Renomeie image_348f16
    },
  },

  // =====================================================================
  // PACOTE ANIME & DREAM
  // =====================================================================

  {
    id: "theme-anime-sword",
    name: "Ronin Monochrome",
    description: "Estilo mangá preto e branco. Alto contraste e seriedade.",
    previewColor: "bg-[#171717]", // Preto
    theme: {
      backgroundColor: "#0a0a0a", // Preto Absoluto
      boxColor: "#171717",        // Cinza Chumbo
      sidebarColor: "#000000",    // Preto
      textColor: "#e5e5e5",       // Branco Suave
      primaryColor: "#a3a3a3",    // Prata/Cinza
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/anime-sword.png", // Renomeie image_341e53
    },
  },
  {
    id: "theme-dream-star",
    name: "Starlight Wishes",
    description: "Vaporwave sonhador. Rosa, roxo e uma estrela guia brilhante.",
    previewColor: "bg-[#facc15]", // Amarelo Estrela
    theme: {
      backgroundColor: "#4c1d95", // Roxo Base
      boxColor: "#701a75",        // Magenta Escuro
      sidebarColor: "#2e1065",    // Índigo Profundo
      textColor: "#fdf4ff",       // Branco Rosado
      primaryColor: "#facc15",    // Amarelo Dourado (A Estrela)
      boxOpacity: 0.8,
      wallpaper: "custom",
      customImage: "/images-themes/dream-star.png", // Renomeie image_34217a
    },
  },
  {
    id: "theme-blueprint",
    name: "Engineer Blue",
    description: "Estilo planta baixa técnica.",
    previewColor: "bg-[#1e3a8a]",
    theme: {
      backgroundColor: "#172554",
      boxColor: "#1e3a8a",
      sidebarColor: "#0f172a",
      textColor: "#bfdbfe",
      primaryColor: "#60a5fa",
      boxOpacity: 0.8,
      wallpaper: "blueprint",
      customImage: null,
    },
  },
  {
    id: "theme-hallow",
    name: "Hallow-Cat",
    description: "Noite de Halloween com wallpaper custom.",
    previewColor: "bg-[#fb923c]",
    theme: {
      backgroundColor: "#0f172a",
      boxColor: "#312e81",
      sidebarColor: "#1e1b4b",
      textColor: "#ffedd5",
      primaryColor: "#fb923c",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/hallow-cat.png",
    },
  },
  {
    id: "theme-pink-cat",
    name: "Midnight Pink Cat",
    description: "Misterioso e vibrante. Gatos noturnos sob a luz de uma lua rosa neon.",
    previewColor: "bg-[#db2777]",
    theme: {
      backgroundColor: "#130819",
      boxColor: "#2a1033",
      sidebarColor: "#0f0414",
      textColor: "#fbcfe8",
      primaryColor: "#ec4899",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/pink-cat.png",
    },
  },
  {
    id: "theme-onepiece-luffy",
    name: "One Piece: Luffy",
    description: "Neutro e sereno. Tons de mar e areia.",
    previewColor: "bg-[#4DA6FF]",
    theme: {
      backgroundColor: "#2C3E50",
      boxColor: "#4A6572",
      sidebarColor: "#20303B",
      textColor: "#EAEAEA",
      primaryColor: "#4DA6FF",
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/onepiece-luffy.png",
    },
  },
  {
    id: "theme-cozy-cat",
    name: "Cozy Cat Reading",
    description: "Ambiente noturno chuvoso, perfeito para leitura.",
    previewColor: "bg-[#2dd4bf]",
    theme: {
      backgroundColor: "#041518",
      boxColor: "#0f2e2e",
      sidebarColor: "#021214",
      textColor: "#ccfbf1",
      primaryColor: "#2dd4bf",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/cozy-cat.png",
    },
  },
  {
    id: "theme-rainy-forest",
    name: "Rainy Forest",
    description: "Tons de verde-petróleo e cinzas marinhos.",
    previewColor: "bg-[#40c9a9]",
    theme: {
      backgroundColor: "#162D2C",
      boxColor: "#254746",
      sidebarColor: "#102221",
      textColor: "#E0EFEF",
      primaryColor: "#40c9a9",
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/One-Piece.png" 
    }
  },
  {
    id: "theme-ghibli-ocean",
    name: "Ghibli Ocean",
    description: "Inspirado em Ponyo. Fundo do mar.",
    previewColor: "bg-[#e6525a]",
    theme: {
      backgroundColor: "#151c33",
      boxColor: "#29325c",
      sidebarColor: "#0e1425",
      textColor: "#e0f7ff",
      primaryColor: "#e6525a",
      boxOpacity: 0.95,
      wallpaper: "custom",
      customImage: "/images-themes/ponyo-ocean.png"
    }
  },
  {
    id: "theme-ghibli-forest",
    name: "Ghibli Forest",
    description: "Tons terrosos, verde musgo e luz amarela.",
    previewColor: "bg-[#ffb703]",
    theme: {
      backgroundColor: "#2e3d36",
      boxColor: "#47594d",
      sidebarColor: "#20312a",
      textColor: "#e9dbb2",
      primaryColor: "#ffb703",
      boxOpacity: 0.95,
      wallpaper: "custom",
      customImage: "/images-themes/totoro-forest.png"
    }
  },
];

// =====================================================================
// 3. SETUPS COMPLETOS (Muda Layout + Cores + Widgets + Conteúdo)
// =====================================================================
export const readySetups = [
  {
    id: "setup-nordic",
    name: "Nordic Minimalist",
    description: "Frio, limpo e organizado. Ótimo para foco intenso sem distrações.",
    boxes: ["tasks-nord", "calendar-nord", "notepad-nord"],
    layouts: {
      lg: [
        { i: "tasks-nord", x: 0, y: 0, w: 2, h: 6 },
        { i: "calendar-nord", x: 2, y: 0, w: 1, h: 4 },
        { i: "notepad-nord", x: 3, y: 0, w: 1, h: 4 },
      ],
      md: [
        { i: "tasks-nord", x: 0, y: 0, w: 2, h: 6 },
        { i: "calendar-nord", x: 0, y: 6, w: 1, h: 4 },
        { i: "notepad-nord", x: 1, y: 6, w: 1, h: 4 },
      ],
      sm: [{ i: "tasks-nord", x: 0, y: 0, w: 1, h: 6 }],
    },
    theme: {
      backgroundColor: "#2e3440",
      boxColor: "#3b4252",
      sidebarColor: "#242933",
      textColor: "#d8dee9",
      primaryColor: "#88c0d0",
      boxOpacity: 1,
      wallpaper: "plain",
      customImage: null,
    },
    content: {
      "notepad-nord": {
        text: "❄️ Ideias:\n- Organizar arquivos\n- Revisar código\n- Planejar sprint",
      },
    },
    icon: <Snowflake size={24} />,
    color: "bg-cyan-600",
  },
  {
    id: "setup-catppuccin",
    name: "Catppuccin Code",
    description: "A estética favorita dos devs. Tons pastéis, fundo suave e foco total.",
    boxes: ["tasks-cat", "pomodoro-cat", "embedded-lofi-cat", "notepad-cat"],
    layouts: {
      lg: [
        { i: "tasks-cat", x: 0, y: 0, w: 2, h: 6 },
        { i: "pomodoro-cat", x: 2, y: 0, w: 1, h: 4 },
        { i: "notepad-cat", x: 3, y: 0, w: 1, h: 4 },
        { i: "embedded-lofi-cat", x: 2, y: 4, w: 2, h: 2 },
      ],
      md: [
        { i: "tasks-cat", x: 0, y: 0, w: 2, h: 6 },
        { i: "pomodoro-cat", x: 0, y: 6, w: 2, h: 4 },
        { i: "notepad-cat", x: 0, y: 10, w: 2, h: 4 },
      ],
      sm: [{ i: "tasks-cat", x: 0, y: 0, w: 1, h: 6 }],
    },
    theme: {
      backgroundColor: "#1e1e2e",
      boxColor: "#313244",
      sidebarColor: "#181825",
      textColor: "#cdd6f4",
      primaryColor: "#cba6f7",
      boxOpacity: 1,
      wallpaper: "plain",
      customImage: null,
    },
    content: {
      "embedded-lofi-cat": {
        url: "https://www.youtube.com/embed/jfKfPfyJRdk",
        mode: "video",
      },
      "notepad-cat": {
        text: "// TODO:\n- Configurar ambiente\n- Instalar dependências\n- Café ☕",
      },
    },
    icon: <Cat size={24} />,
    color: "bg-violet-400",
  },
  {
    id: "setup-hallow",
    name: "Hallow-Cat Night",
    description: "Noite de Halloween aconchegante. Tons profundos de roxo e laranja vibrante.",
    boxes: ["tasks-hallow", "pomodoro-hallow", "embedded-lofi-hallow"],
    layouts: {
      lg: [
        { i: "tasks-hallow", x: 0, y: 0, w: 2, h: 6 },
        { i: "pomodoro-hallow", x: 2, y: 0, w: 1, h: 4 },
        { i: "embedded-lofi-hallow", x: 3, y: 0, w: 1, h: 4 },
      ],
    },
    theme: {
      backgroundColor: "#0f172a",
      boxColor: "#312e81",
      sidebarColor: "#1e1b4b",
      textColor: "#ffedd5",
      primaryColor: "#fb923c",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/hallow-cat.png",
    },
    icon: <Ghost size={24} />,
    color: "bg-orange-600",
  },
  {
    id: "setup-pink-cat",
    name: "Midnight Pink Cat",
    description: "Misterioso e vibrante. Gatos noturnos sob a luz de uma lua rosa neon.",
    boxes: ["tasks-pink", "notepad-pink", "habit-pink"],
    layouts: {
      lg: [
        { i: "tasks-pink", x: 0, y: 0, w: 2, h: 6 },
        { i: "notepad-pink", x: 2, y: 0, w: 1, h: 4 },
        { i: "habit-pink", x: 3, y: 0, w: 1, h: 4 },
      ],
    },
    theme: {
      backgroundColor: "#130819",
      boxColor: "#2a1033",
      sidebarColor: "#0f0414",
      textColor: "#fbcfe8",
      primaryColor: "#ec4899",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/pink-cat.png",
    },
    icon: <Cat size={24} />,
    color: "bg-pink-600",
  },
  {
    id: "setup-onepiece",
    name: "One Piece: Luffy",
    description: "Neutro e sereno. Tons de mar e areia com foco na aventura.",
    boxes: ["tasks-op", "goals-op"],
    layouts: {
      lg: [
        { i: "tasks-op", x: 0, y: 0, w: 2, h: 6 },
        { i: "goals-op", x: 2, y: 0, w: 2, h: 4 },
      ],
    },
    theme: {
      backgroundColor: "#2C3E50",
      boxColor: "#4A6572",
      sidebarColor: "#20303B",
      textColor: "#EAEAEA",
      primaryColor: "#4DA6FF",
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/onepiece-luffy.png",
    },
    icon: <Anchor size={24} />,
    color: "bg-blue-500",
  },
  {
    id: "setup-cozy",
    name: "Cozy Cat Reading",
    description: "Ambiente noturno chuvoso, perfeito para leitura e foco relaxante.",
    boxes: [
      "books-tracker",
      "library-read",
      "embedded-lofi",
      "pomodoro-read",
      "notepad-read",
      "habit-read",
    ],
    layouts: {
      lg: [
        { i: "books-tracker", x: 0, y: 0, w: 2, h: 4 },
        { i: "library-read", x: 2, y: 0, w: 2, h: 4 },
        { i: "embedded-lofi", x: 0, y: 4, w: 2, h: 5 },
        { i: "pomodoro-read", x: 2, y: 4, w: 1, h: 4 },
        { i: "notepad-read", x: 3, y: 4, w: 1, h: 4 },
        { i: "habit-read", x: 2, y: 8, w: 2, h: 3 },
      ],
      md: [
        { i: "books-tracker", x: 0, y: 0, w: 2, h: 4 },
        { i: "library-read", x: 0, y: 4, w: 2, h: 4 },
        { i: "embedded-lofi", x: 0, y: 8, w: 2, h: 4 },
        { i: "pomodoro-read", x: 0, y: 12, w: 1, h: 4 },
        { i: "notepad-read", x: 1, y: 12, w: 1, h: 4 },
      ],
      sm: [{ i: "books-tracker", x: 0, y: 0, w: 1, h: 4 }],
    },
    theme: {
      backgroundColor: "#041518",
      boxColor: "#0f2e2e",
      sidebarColor: "#021214",
      textColor: "#ccfbf1",
      primaryColor: "#2dd4bf",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/cozy-cat.png",
    },
    content: {
      "books-tracker": {
        books: [
          {
            id: "t1",
            title: "O Nome do Vento",
            current: 120,
            total: 600,
            color: "bg-emerald-500",
          },
        ],
        settings: { pageStep: 15 },
      },
      "library-read": {
        books: [
          {
            id: "b1",
            title: "Harry Potter",
            total: 350,
            current: 350,
            color: "#be185d",
            height: 45,
            pattern: 0,
            categoryId: "1",
            completed: true,
          },
        ],
        settings: { woodColor: "#0f172a", wallColor: "transparent" },
      },
      "embedded-lofi": {
        url: "https://www.youtube.com/embed/jfKfPfyJRdk",
        mode: "video",
        isLocked: true,
      },
    },
    icon: <Cat size={24} />,
    color: "bg-teal-700",
  },
  {
    id: "setup-dracula-full",
    name: "Dracula Workstation",
    description: "Setup completo com layout otimizado para devs.",
    boxes: ["tasks-dracula", "pomodoro-dracula", "code-music"],
    layouts: {
      lg: [
        { i: "tasks-dracula", x: 0, y: 0, w: 2, h: 6 },
        { i: "pomodoro-dracula", x: 2, y: 0, w: 1, h: 4 },
        { i: "code-music", x: 3, y: 0, w: 1, h: 4 },
      ],
      md: [
        { i: "tasks-dracula", x: 0, y: 0, w: 2, h: 6 },
        { i: "pomodoro-dracula", x: 0, y: 6, w: 2, h: 4 },
      ],
      sm: [{ i: "tasks-dracula", x: 0, y: 0, w: 1, h: 6 }],
    },
    theme: {
      backgroundColor: "#282a36",
      boxColor: "#44475a",
      sidebarColor: "#282a36",
      textColor: "#f8f8f2",
      primaryColor: "#bd93f9",
      boxOpacity: 1,
      wallpaper: "plain",
      customImage: null,
    },
    content: {
      "code-music": {
        url: "https://www.youtube.com/embed/jfKfPfyJRdk",
        mode: "video",
      },
    },
    icon: <MonitorPlay size={24} />,
    color: "bg-purple-600",
  },
  {
    id: "setup-rainy-forest",
    name: "Rainy Forest",
    description: "Tons de verde-petróleo e cinzas marinhos. Tema escuro de baixo contraste para foco.",
    boxes: ["tasks-forest", "garden-forest"],
    layouts: {
      lg: [
        { i: "tasks-forest", x: 0, y: 0, w: 2, h: 6 },
        { i: "garden-forest", x: 2, y: 0, w: 2, h: 4 },
      ],
    },
    theme: {
      backgroundColor: "#162D2C",
      boxColor: "#254746",
      sidebarColor: "#102221",
      textColor: "#E0EFEF",
      primaryColor: "#40c9a9",
      boxOpacity: 0.9,
      wallpaper: "custom",
      customImage: "/images-themes/One-Piece.png" 
    },
    icon: <Leaf size={24} />,
    color: "bg-emerald-800",
  },
  {
    id: "setup-ghibli-ocean",
    name: "Ghibli: Ocean Run",
    description: "Tons profundos de azul e indigo com destaque vermelho vivo.",
    boxes: ["tasks-ponyo", "water-ponyo"],
    layouts: {
      lg: [
        { i: "tasks-ponyo", x: 0, y: 0, w: 2, h: 6 },
        { i: "water-ponyo", x: 2, y: 0, w: 1, h: 4 },
      ],
    },
    theme: {
      backgroundColor: "#151c33",
      boxColor: "#29325c",
      sidebarColor: "#0e1425",
      textColor: "#e0f7ff",
      primaryColor: "#e6525a",
      boxOpacity: 0.95,
      wallpaper: "custom",
      customImage: "/images-themes/ponyo-ocean.png"
    },
    icon: <Fish size={24} />,
    color: "bg-red-500",
  },
  {
    id: "setup-ghibli-forest",
    name: "Ghibli: Totoro Forest",
    description: "Mundo quente e sombrio. Tons terrosos e luz amarela.",
    boxes: ["tasks-totoro", "garden-totoro"],
    layouts: {
      lg: [
        { i: "tasks-totoro", x: 0, y: 0, w: 2, h: 6 },
        { i: "garden-totoro", x: 2, y: 0, w: 2, h: 4 },
      ],
    },
    theme: {
      backgroundColor: "#2e3d36",
      boxColor: "#47594d",
      sidebarColor: "#20312a",
      textColor: "#e9dbb2",
      primaryColor: "#ffb703",
      boxOpacity: 0.95,
      wallpaper: "custom",
      customImage: "/images-themes/totoro-forest.png"
    },
    icon: <Sprout size={24} />,
    color: "bg-yellow-600",
  },
];