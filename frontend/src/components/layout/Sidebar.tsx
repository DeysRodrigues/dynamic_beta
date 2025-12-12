import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import {
  Menu,
  X,
  Home,
  ListTodo,
  Calendar,
  ShoppingBag,
  Settings,
  Database,
  Moon,
  Sun,
  Ghost,
  Type,
  Image,
  RotateCcw,
  PaintBucket,
  BoxSelect,
  Brush,
  User,
  Edit3,
  Camera,
  Save,
  FileCode,
  Check,
  LayoutTemplate,
} from "lucide-react";

import PersonalizationModal from "./modals/PersonalizationModal";
import GeneralBackupModal from "./modals/GeneralBackupModal";
import { useThemeStore } from "@/store/useThemeStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

// --- SETTINGS DRAWER (Painel Lateral Direito) ---
const SettingsDrawer = ({ onClose }: { onClose: () => void }) => {
  const {
    sidebarColor,
    setSidebarColor,
    boxOpacity,
    setBoxOpacity,
    boxColor,
    setBoxColor,
    textColor,
    setTextColor,
    primaryColor,
    setPrimaryColor,
    backgroundColor,
    setBackgroundColor,
    wallpaper,
    applyPreset,
  } = useThemeStore(useShallow((state) => ({ ...state })));

  const [monospace, setMonospace] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  useEffect(() => {
    if (monospace)
      document.body.style.setProperty(
        "font-family",
        "'Cascadia Mono', 'Courier New', monospace",
        "important"
      );
    else document.body.style.removeProperty("font-family");
  }, [monospace]);

  // Componente de Cor Compacto (Input na Esquerda para não cortar)
  const ColorPicker = ({ label, value, onChange, icon: Icon }: any) => (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition group/picker">
      {/* 1. Cor (Input) */}
      <div
        className="relative h-8 w-8 rounded-full shadow-sm border border-white/20 overflow-hidden cursor-pointer ring-2 ring-white/5 hover:ring-white/20 transition shrink-0"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* 2. Texto */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase opacity-60 flex items-center gap-1.5 group-hover/picker:opacity-100 transition text-white">
          <Icon size={12} /> {label}
        </span>
        <span className="text-[9px] font-mono opacity-30 uppercase truncate text-white">
          {value}
        </span>
      </div>
    </div>
  );

  const toggleDarkMode = () => {
    const isLight =
      backgroundColor === "#f9fafb" || backgroundColor === "#ffffff";
    const darkColors = {
      backgroundColor: "#020617",
      boxColor: "#0f172a",
      sidebarColor: "#020617",
      textColor: "#e2e8f0",
      primaryColor: "#6366f1",
      boxOpacity: 0.95,
    };
    const lightColors = {
      backgroundColor: "#f9fafb",
      boxColor: "#ffffff",
      sidebarColor: "hsl(222.2 47.4% 11.2%)",
      textColor: "#1e293b",
      primaryColor: "hsl(222.2 47.4% 11.2%)",
      boxOpacity: 1,
    };
    const preset = {
      ...(isLight ? darkColors : lightColors),
      ...(wallpaper !== "custom" && { wallpaper: "plain" as const }),
    };
    applyPreset(preset);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      {/* Área clicável transparente para fechar */}
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />

      {/* O Painel desliza da direita */}
      <div className="h-full w-80 bg-[#09090b]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300 flex flex-col text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Personalizar
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
          {/* 1. Tema Rápido */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Ambiente
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition text-xs font-medium text-white/80 hover:text-white"
              >
                {backgroundColor === "#020617" ? (
                  <Moon size={14} className="text-purple-400" />
                ) : (
                  <Sun size={14} className="text-yellow-400" />
                )}
                <span>{backgroundColor === "#020617" ? "Dark" : "Light"}</span>
              </button>
              <button
                onClick={() => setShowPersonalization(true)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition text-xs font-medium text-white/80 hover:text-white"
              >
                <Image size={14} className="text-blue-400" />
                <span>Fundo</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs font-medium flex items-center gap-2 text-white/80">
                <Ghost size={14} /> Transparência
              </span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={boxOpacity}
                onChange={(e) => setBoxOpacity(Number(e.target.value))}
                className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </section>

          {/* 2. Cores Detalhadas */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Cores do Sistema
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <ColorPicker
                label="Destaque (Links/Botões)"
                value={primaryColor}
                onChange={setPrimaryColor}
                icon={Brush}
              />
              <ColorPicker
                label="Fundo da Página"
                value={backgroundColor}
                onChange={setBackgroundColor}
                icon={LayoutTemplate}
              />
              <ColorPicker
                label="Barra Lateral"
                value={sidebarColor}
                onChange={setSidebarColor}
                icon={PaintBucket}
              />
              <ColorPicker
                label="Fundo dos Widgets"
                value={boxColor}
                onChange={setBoxColor}
                icon={BoxSelect}
              />
              <ColorPicker
                label="Cor do Texto"
                value={textColor}
                onChange={setTextColor}
                icon={Type}
              />
            </div>
          </section>

          {/* 3. Extras */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Sistema
            </h3>
            <button
              onClick={() => setMonospace(!monospace)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-xs font-medium ${
                monospace
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/5 border-white/5 text-white/60 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileCode size={14} /> Fonte Hacker (Monospace)
              </span>
              {monospace && <Check size={14} />}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowBackup(true)}
                className="py-2.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 text-[10px] font-bold transition flex items-center justify-center gap-1.5 border border-white/5"
              >
                <Database size={14} /> Backup
              </button>
              <button
                onClick={() => {
                  if (confirm("Resetar TUDO?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="py-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 text-[10px] font-bold transition flex items-center justify-center gap-1.5 border border-white/5"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </section>
        </div>

        <PersonalizationModal
          isOpen={showPersonalization}
          onClose={() => setShowPersonalization(false)}
        />
        <GeneralBackupModal
          isOpen={showBackup}
          onClose={() => setShowBackup(false)}
        />
      </div>
    </div>
  );
};

// --- PROFILE EDIT MODAL ---
const ProfileEditModal = ({ onClose }: { onClose: () => void }) => {
  const { name, subtitle, avatar, setName, setSubtitle, setAvatar } =
    useUserStore();
  const [localName, setLocalName] = useState(name);
  const [localSub, setLocalSub] = useState(subtitle);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setName(localName);
    setSubtitle(localSub);
    onClose();
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
      <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <User size={20} /> Editar Perfil
        </h3>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={
                avatar ||
                "https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg"
              }
              className="w-24 h-24 rounded-full object-cover border-4 border-white/10 group-hover:border-purple-500 transition-all"
              alt="Profile"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFile}
            />
          </div>
          <p className="text-xs text-white/40">Clique para alterar foto</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-white/50 uppercase ml-1">
              Nome
            </label>
            <input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white/50 uppercase ml-1">
              Subtítulo
            </label>
            <input
              value={localSub}
              onChange={(e) => setLocalSub(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full mt-6 bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Save size={18} /> Salvar
        </button>
      </div>
    </div>
  );
};

// --- SIDEBAR PRINCIPAL ---

interface SidebarProps {
  items?: { label: string; icon?: React.ReactNode; path: string }[];
}

const Sidebar = React.memo(({ items }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const { sidebarColor } = useThemeStore(
    useShallow((state) => ({ sidebarColor: state.sidebarColor }))
  );
  const { name, subtitle, avatar } = useUserStore();
  const isFocusMode = useDashboardStore((state) => state.isFocusMode);

  const navigate = useNavigate();
  const locationPath = useLocation().pathname;

  React.useEffect(() => {
    setIsOpen(false);
  }, [locationPath]);

  const defaultItems = [
    { label: "Dashboard", path: "/", icon: <Home size={20} /> },
    { label: "Minhas Tasks", path: "/tasks", icon: <ListTodo size={20} /> },
    { label: "Planejamento", path: "/planner", icon: <Calendar size={20} /> },
    {
      label: "Loja de Widgets",
      path: "/store",
      icon: <ShoppingBag size={20} />,
    },
  ];
  const menuItems = items && items.length > 0 ? items : defaultItems;

  const sidebarClasses = isFocusMode
    ? "-translate-x-full w-0 opacity-0 overflow-hidden"
    : "w-72 md:w-64 translate-x-0 opacity-100";

  return (
    <>
      {showSettings && (
        <SettingsDrawer onClose={() => setShowSettings(false)} />
      )}
      {showProfileEdit && (
        <ProfileEditModal onClose={() => setShowProfileEdit(false)} />
      )}

      {/* Botão Mobile */}
      {!isFocusMode && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg border border-white/10 active:scale-95 transition-all text-white backdrop-blur-md"
          style={{ backgroundColor: sidebarColor }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen z-50 flex flex-col justify-between py-8 transition-all duration-500 ease-in-out border-r border-white/5 shadow-2xl backdrop-blur-xl bg-background/80",
          isOpen ? "translate-x-0 w-72" : sidebarClasses,
          "md:translate-x-0",
          isFocusMode
            ? "md:w-0 md:opacity-0 md:overflow-hidden md:py-0 md:border-none"
            : "md:relative md:w-64"
        )}
        style={{ backgroundColor: sidebarColor }}
      >
        <div className="flex flex-col items-center w-full px-6 overflow-y-auto custom-scrollbar h-full">
          {/* 1. PERFIL DO USUÁRIO */}
          <div className="flex flex-col items-center gap-4 w-full mb-8 pt-2">
            <div className="w-full flex justify-end -mr-2">
              <NotificationBell />
            </div>

            <div
              className="relative group cursor-pointer flex flex-col items-center"
              onClick={() => setShowProfileEdit(true)}
              title="Editar Perfil"
            >
              <div className="relative">
                <img
                  src={
                    avatar ||
                    "https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg"
                  }
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-[3px] border-white/20 group-hover:border-white transition shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-75 shadow-md">
                  <Edit3 size={14} />
                </div>
              </div>
              <div className="text-center mt-3 group-hover:scale-105 transition-transform">
                <h2 className="font-bold text-lg tracking-tight text-white">
                  {name}
                </h2>
                <p className="text-xs text-white/50 font-medium bg-black/10 px-3 py-1 rounded-full mt-1 border border-white/5">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* 2. MENU */}
          <nav className="flex-1 w-full space-y-2">
            {menuItems.map((item) => {
              const isActive = locationPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden",
                    isActive
                      ? "bg-white/10 text-white shadow-inner font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" />
                  )}
                  <span
                    className={cn(
                      "transition-transform duration-300",
                      isActive
                        ? "scale-110 text-primary"
                        : "group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

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
