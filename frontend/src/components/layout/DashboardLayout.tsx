import Sidebar from "@/features/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { Home, ListTodo, Calendar, ShoppingBag, Palette, Book, Target } from "lucide-react";
import { useThemeStore, getWallpaperStyle } from "@/store/useThemeStore";
import { ThemeApplicator } from "./ThemeApplicator";
import { useMemo } from "react"; 
import PomodoroManager from "./PomodoroManager";
import { HydrationGate } from "./HydrationGate";

function LayoutShell() {
  const { wallpaper, customImage, wallpaperBlur, wallpaperBrightness } = useThemeStore();

  const sidebarItems = useMemo(() => [
    { label: "Home", path: "/", icon: <Home size={18} /> },
    { label: "Tasks", path: "/tasks", icon: <ListTodo size={18} /> },
    { label: "Projetos", path: "/projects", icon: <Target size={18} /> },
    { label: "Planner", path: "/planner", icon: <Calendar size={18} /> },
    { label: "Widgets", path: "/store", icon: <ShoppingBag size={18} /> },
    { label: "Temas", path: "/themes", icon: <Palette size={18} /> }, 
    { label: "Wiki", path: "/wiki", icon: <Book size={18} /> },
  ], []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-[var(--background-color)]">
      <ThemeApplicator />
      <PomodoroManager />
      
      {/* BACKGROUND LAYER (Fixed & Filtered) */}
      <div 
        className="absolute inset-0 z-0 transition-[filter] duration-500 pointer-events-none"
        style={{
          ...getWallpaperStyle(wallpaper, customImage),
          filter: `blur(${wallpaperBlur}px) brightness(${wallpaperBrightness}%)`,
          transform: 'scale(1.05)' // Prevents blur edges from showing white borders
        }}
      />

      {/* Passes the frozen list */}
      <Sidebar items={sidebarItems} />
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-transparent">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-16 md:pt-4 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/** The app shell, shown only once the saved data has been read. */
export default function DashboardLayout() {
  return (
    <HydrationGate>
      <LayoutShell />
    </HydrationGate>
  );
}
