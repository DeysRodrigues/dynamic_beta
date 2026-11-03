import type { ThemeItem, WallpaperThemeItem } from "@/types/Theme";

// =====================================================================
// 1. COLOR PALETTES (change only the colors, keep the current wallpaper)
// =====================================================================
export const colorPalettes: ThemeItem[] = [
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
// 2. IMMERSION THEMES (change colors and wallpaper, keep the layout)
// =====================================================================
export const wallpaperThemes: WallpaperThemeItem[] = [
 

// =====================================================================
  // PACOTE ESPECIAL: HOMENAGEM & GATINHOS
  // =====================================================================
  
  {
    id: "theme-cat-love",
    name: "Amor Eterno", // Homenagem delicada
    description: "Um entardecer suave e romântico. Para momentos de paz a dois. (for u, c sz)",
    previewColor: "bg-[#8b5cf6]", // Roxo Suave
    theme: {
      backgroundColor: "#2e2a45", // Twilight blue/purple (sky background)
      boxColor: "#3e3859",        // Slightly lighter purple for the boxes
      sidebarColor: "#1e1b2e",    // Escuro aconchegante
      textColor: "#e9d5ff",       // Light lilac (readable text)
      primaryColor: "#f472b6",    // Soft pink (clouds, flowers and love)
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
      sidebarColor: "#4a403a",    // Coffee brown
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
      backgroundColor: "#dbeafe", // Very light baby blue
      boxColor: "#bfdbfe",        // Translucent sky blue
      sidebarColor: "#1e3a8a",    // Azul Real Escuro
      textColor: "#172554",       // Azul Profundo
      primaryColor: "#fb7185",    // Flower pink (Hornet's highlight)
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
      textColor: "#f5d0fe",       // Bright pale pink
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
      backgroundColor: "#e0f2fe", // Light sky blue
      boxColor: "#ffffff",        // Branco Limpo
      sidebarColor: "#0c4a6e",    // Petrol blue
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
      backgroundColor: "#ffedd5", // Very pale orange
      boxColor: "#fff7ed",        // Branco quente
      sidebarColor: "#7c2d12",    // Marrom Avermelhado
      textColor: "#431407",       // Coffee brown
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
      backgroundColor: "#eff6ff", // Water blue
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
      sidebarColor: "#2e1065",    // Deep indigo
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
