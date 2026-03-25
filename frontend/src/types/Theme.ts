import type { Layouts } from "react-grid-layout";
import type { WallpaperType } from "@/store/useThemeStore";

export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  theme: {
    backgroundColor: string;
    boxColor: string;
    sidebarColor: string;
    textColor: string;
    primaryColor: string;
    boxOpacity: number;
    wallpaper?: WallpaperType;
    customImage?: string | null;
  };
}

export interface WallpaperThemeItem extends ThemeItem {
  previewColor: string;
}

export interface SetupItem extends ThemeItem {
  boxes: string[];
  layouts: Layouts;
  content?: Record<string, unknown>;
  icon: React.ReactNode;
  color?: string;
}
