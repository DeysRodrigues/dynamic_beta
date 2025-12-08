import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Home, ListTodo, Calendar, ShoppingBag, Palette } from "lucide-react";
import { useThemeStore, getWallpaperStyle } from "@/store/useThemeStore";
import { ThemeApplicator } from "./ThemeApplicator";
import { useMemo } from "react"; 

export default function DashboardLayout() {
  const { wallpaper, customImage } = useThemeStore();

  const sidebarItems = useMemo(() => [
    { label: "Home", path: "/", icon: <Home size={18} /> },
    { label: "Tasks", path: "/tasks", icon: <ListTodo size={18} /> },
    { label: "Planner", path: "/planner", icon: <Calendar size={18} /> },
    { label: "Widgets", path: "/store", icon: <ShoppingBag size={18} /> },
    { label: "Temas", path: "/themes", icon: <Palette size={18} /> }, 
  ], []);

  return (
    <div className="flex h-screen w-full overflow-hidden transition-all duration-500">
      <ThemeApplicator />
      {/* Passa a lista congelada */}
      <Sidebar items={sidebarItems} />
      
      <main 
        className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-500"
        style={getWallpaperStyle(wallpaper, customImage)}
      >
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-20 md:pt-6 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}