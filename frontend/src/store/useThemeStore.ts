import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WallpaperType = "plain" | "dots" | "grid" | "pixel-art" | "clouds" | "blueprint" | "custom";

interface ThemeState {
  wallpaper: WallpaperType;
  customImage: string | null;
  sidebarColor: string;
  primaryColor: string;
  boxOpacity: number;
  boxColor: string;
  textColor: string;
  backgroundColor: string; // Cor de fundo da página
  
  setWallpaper: (w: WallpaperType) => void;
  setCustomImage: (img: string) => void;
  setSidebarColor: (color: string) => void;
  setPrimaryColor: (color: string) => void;
  setBoxOpacity: (opacity: number) => void;
  setBoxColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  
  // Função mágica que carrega um tema completo de uma vez (usada pelos Setups)
  applyPreset: (preset: Partial<ThemeState>) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Valores Padrão (Light Mode Indigo)
      wallpaper: "plain",
      customImage: null,
      sidebarColor: "hsl(222.2 47.4% 11.2%)",
      primaryColor: "hsl(222.2 47.4% 11.2%)",
      boxOpacity: 1,
      boxColor: "#ffffff",
      textColor: "#1e293b",
      backgroundColor: "#f9fafb",
      
      setWallpaper: (w) => set({ wallpaper: w }),
      setCustomImage: (img) => set({ customImage: img, wallpaper: "custom" }),
      setSidebarColor: (color) => set({ sidebarColor: color }),
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setBoxOpacity: (opacity) => set({ boxOpacity: opacity }),
      setBoxColor: (color) => set({ boxColor: color }),
      setTextColor: (color) => set({ textColor: color }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      
      // Recebe um objeto com várias propriedades e atualiza tudo junto
      applyPreset: (preset) => set((state) => ({ ...state, ...preset })),
    }),
    { name: "theme-storage" }
  )
);

// Função auxiliar para gerar o CSS do background
export const getWallpaperStyle = (type: WallpaperType, customImg?: string | null) => {
  // A cor de fundo base vem da variável CSS que é controlada pelo store
  const baseBg = "var(--background-color)";

  if (type === "custom" && customImg) {
    return {
      backgroundImage: `url(${customImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: baseBg,
    };
  }

  // Padrões CSS (Patterns)
  const patterns: Record<string, any> = {
    dots: { 
      backgroundColor: baseBg, 
      backgroundImage: "radial-gradient(var(--wallpaper-dots-fg) 1.5px, transparent 1.5px)", 
      backgroundSize: "20px 20px" 
    },
    grid: { 
      backgroundColor: baseBg, 
      backgroundImage: "linear-gradient(var(--wallpaper-grid-fg) 1px, transparent 1px), linear-gradient(90deg, var(--wallpaper-grid-fg) 1px, transparent 1px)", 
      backgroundSize: "40px 40px" 
    },
    "pixel-art": { 
      backgroundColor: baseBg, 
      opacity: 1, 
      backgroundImage: "linear-gradient(135deg, var(--wallpaper-pixel-art-fg) 25%, transparent 25%), linear-gradient(225deg, var(--wallpaper-pixel-art-fg) 25%, transparent 25%), linear-gradient(45deg, var(--wallpaper-pixel-art-fg) 25%, transparent 25%), linear-gradient(315deg, var(--wallpaper-pixel-art-fg) 25%, transparent 25%)", 
      backgroundPosition: "10px 0, 10px 0, 0 0, 0 0", 
      backgroundSize: "20px 20px", 
      backgroundRepeat: "repeat" 
    },
    blueprint: { 
      backgroundColor: baseBg, 
      backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", 
      backgroundSize: "20px 20px" 
    },
    clouds: { 
      backgroundColor: baseBg, 
      backgroundImage: "radial-gradient(circle at 50% 50%, var(--wallpaper-clouds-fg) 20%, transparent 20%), radial-gradient(circle at 0% 50%, var(--wallpaper-clouds-fg) 20%, transparent 20%)", 
      backgroundSize: "60px 60px" 
    },
  };

  // Se o tipo não estiver na lista (ex: 'plain'), retorna só a cor de fundo
  return patterns[type] || { backgroundColor: baseBg };
};