import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Calendar, Home, ListTodo, Menu, Settings, ShoppingBag, X } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";
import { ProfileEditModal } from "./ProfileEditModal";
import { SettingsDrawer } from "./SettingsDrawer";
import { SidebarNav, type SidebarItem } from "./SidebarNav";
import { SidebarProfile } from "./SidebarProfile";

const defaultItems: SidebarItem[] = [
  { label: "Dashboard", path: "/", icon: <Home size={20} /> },
  { label: "Minhas Tasks", path: "/tasks", icon: <ListTodo size={20} /> },
  { label: "Planejamento", path: "/planner", icon: <Calendar size={20} /> },
  { label: "Loja de Widgets", path: "/store", icon: <ShoppingBag size={20} /> },
];

interface SidebarProps {
  items?: SidebarItem[];
}

const Sidebar = React.memo(({ items }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const { sidebarColor } = useThemeStore(
    useShallow((state) => ({ sidebarColor: state.sidebarColor }))
  );
  const isFocusMode = useDashboardStore((state) => state.isFocusMode);
  const locationPath = useLocation().pathname;

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [locationPath]);

  const menuItems = items && items.length > 0 ? items : defaultItems;

  const sidebarClasses = isFocusMode
    ? "-translate-x-full w-0 opacity-0 overflow-hidden"
    : "-translate-x-full opacity-100";

  return (
    <>
      {showSettings && <SettingsDrawer onClose={() => setShowSettings(false)} />}
      {showProfileEdit && <ProfileEditModal onClose={() => setShowProfileEdit(false)} />}

      {/* Botão Mobile */}
      {!isFocusMode && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg border border-white/10 active:scale-95 transition-all text-white"
          style={{ backgroundColor: sidebarColor }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen z-50 flex flex-col justify-between py-8 transition-all duration-500 ease-in-out border-r border-white/5 shadow-2xl backdrop-blur-xl bg-background/80",
          isOpen ? "translate-x-0 w-64" : sidebarClasses,
          "md:translate-x-0 md:static",
          isFocusMode
            ? "md:w-0 md:opacity-0 md:overflow-hidden md:py-0 md:border-none"
            : "md:relative md:w-64"
        )}
        style={{ backgroundColor: sidebarColor }}
      >
        <div className="flex flex-col items-center w-full px-6 overflow-y-auto custom-scrollbar h-full">
          <SidebarProfile onEditProfile={() => setShowProfileEdit(true)} />
          <SidebarNav items={menuItems} />

          {/* 3. RODAPÉ (Settings) */}
          <div className="w-full mt-auto pt-6 border-t border-white/5">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Settings
                size={20}
                className="group-hover:rotate-90 transition-transform duration-500"
              />
              <span className="text-sm font-medium">Ajustes</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
