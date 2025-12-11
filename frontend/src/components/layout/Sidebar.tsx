import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import {
  Menu,
  RotateCcw,
  Type,
  ShoppingBag,
  X,
  PaintBucket,
  Ghost,
  BoxSelect,
  Moon,
  Sun,
  FileCode,
  Brush,
  Monitor,
  Image,
  Database, // Novo ícone
} from "lucide-react";

import PersonalizationModal from "./modals/PersonalizationModal";
import GeneralBackupModal from "./modals/GeneralBackupModal"; // Novo Modal
import { useThemeStore } from "@/store/useThemeStore";
import NotificationBell from "./NotificationBell";

interface SidebarProps {
  items?: { label: string; icon?: React.ReactNode; path: string }[];
}

const ColorButton = React.memo(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ icon: Icon, color }: { icon: any; color: string }) => (
    <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
      <Icon size={18} className="text-white/90 drop-shadow-sm" />
      <div
        className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-white/30 shadow-sm"
        style={{ backgroundColor: color }}
      />
    </div>
  )
);

const Sidebar = React.memo(({ items }: SidebarProps) => {
  const [open, setOpen] = useState(false);

  // Modais
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showBackup, setShowBackup] = useState(false); // Estado do Backup

  // Controles Visuais
  const [showOpacity, setShowOpacity] = useState(false);
  const [monospace, setMonospace] = useState(false);
  const [showDyna, setShowDyna] = useState(true); // Estado do Card da Dyna

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
  } = useThemeStore(
    useShallow((state) => ({
      sidebarColor: state.sidebarColor,
      setSidebarColor: state.setSidebarColor,
      boxOpacity: state.boxOpacity,
      setBoxOpacity: state.setBoxOpacity,
      boxColor: state.boxColor,
      setBoxColor: state.setBoxColor,
      textColor: state.textColor,
      setTextColor: state.setTextColor,
      primaryColor: state.primaryColor,
      setPrimaryColor: state.setPrimaryColor,
      backgroundColor: state.backgroundColor,
      setBackgroundColor: state.setBackgroundColor,
      wallpaper: state.wallpaper,
      applyPreset: state.applyPreset,
    }))
  );

  const navigate = useNavigate();
  const locationPath = useLocation().pathname;

  useEffect(() => {
    setOpen(false);
  }, [locationPath]);

  useEffect(() => {
    const body = document.body;
    if (monospace) {
      body.style.setProperty(
        "font-family",
        "'Cascadia Mono', 'Courier New', monospace",
        "important"
      );
    } else {
      body.style.removeProperty("font-family");
    }
  }, [monospace]);

  const toggleDarkMode = () => {
    const isLight =
      backgroundColor === "#f9fafb" || backgroundColor === "#ffffff";

    const darkColors = {
      backgroundColor: "#000000",
      boxColor: "#000000",
      sidebarColor: "#000000",
      textColor: "#ffffff",
      primaryColor: "#8b5cf6",
      boxOpacity: 1,
    };

    const lightColors = {
      backgroundColor: "#f9fafb",
      boxColor: "#ffffff",
      sidebarColor: "hsl(222.2 47.4% 11.2%)",
      textColor: "#1e293b",
      primaryColor: "hsl(222.2 47.4% 11.2%)",
      boxOpacity: 1,
    };

    const colorsToApply = isLight ? darkColors : lightColors;

    const preset = {
      ...colorsToApply,
      ...(wallpaper !== "custom" && { wallpaper: "plain" as const }),
    };
    applyPreset(preset);
  };

  const defaultItems = [
    { label: "Home", path: "/" },
    { label: "Tasks", path: "/tasks" },
    { label: "Planner", path: "/planner" },
    { label: "Widget Store", path: "/store", icon: <ShoppingBag size={18} /> },
  ];

  const menuItems = items && items.length > 0 ? items : defaultItems;

  return (
    <>
      <PersonalizationModal
        isOpen={showPersonalization}
        onClose={() => setShowPersonalization(false)}
      />

      <GeneralBackupModal
        isOpen={showBackup}
        onClose={() => setShowBackup(false)}
      />

      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-lg border border-gray-100 active:scale-95 transition-all text-white"
        style={{ backgroundColor: sidebarColor }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`bg-primary fixed top-0 left-0 h-screen w-72 text-white flex flex-col justify-between py-6 z-50 transform transition-transform duration-300 shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex md:w-64`}
        style={{ backgroundColor: sidebarColor }}
      >
        <div className="flex flex-col items-center gap-6 w-full px-4 overflow-y-auto custom-scrollbar">
          {/* TOPO: Notificações e Perfil */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-full flex justify-end px-2">
              <NotificationBell />
            </div>

            <div className="relative group cursor-pointer">
              <img
                src="https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg"
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-[3px] border-white/30 group-hover:border-white transition shadow-lg"
              />
            </div>

            <div className="text-center">
              <h2 className="font-bold text-xl tracking-tight">
                Dynamic Notes
              </h2>
              <p className="text-xs text-white/70 font-medium bg-black/10 px-3 py-1 rounded-full mt-1">
                cats & tasks
              </p>
            </div>
          </div>

          {/* PAINEL DE CONTROLE (Grid) */}
          <div className="flex flex-col gap-3 bg-black/10 p-3 rounded-2xl w-full">
            {/* Linha 1: Cores Principais */}
            <div className="grid grid-cols-4 gap-2 w-full">
              {[
                {
                  label: "Sidebar",
                  val: sidebarColor,
                  set: setSidebarColor,
                  icon: PaintBucket,
                },
                {
                  label: "Box",
                  val: boxColor,
                  set: setBoxColor,
                  icon: BoxSelect,
                },
                {
                  label: "Text",
                  val: textColor,
                  set: setTextColor,
                  icon: Type,
                },
                {
                  label: "Accent",
                  val: primaryColor,
                  set: setPrimaryColor,
                  icon: Brush,
                },
              ].map((ctrl) => (
                <div key={ctrl.label} className="relative group aspect-square">
                  <button
                    className="w-full h-full rounded-xl hover:bg-white/20 transition border border-white/10"
                    title={`Cor ${ctrl.label}`}
                  >
                    <ColorButton icon={ctrl.icon} color={ctrl.val} />
                  </button>
                  <input
                    type="color"
                    value={ctrl.val}
                    onChange={(e) => ctrl.set(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-white/10"></div>

            {/* Linha 2: Personalização e Modos */}
            <div className="grid grid-cols-4 gap-2 w-full">
              <button
                className="aspect-square rounded-xl hover:bg-white/20 transition flex items-center justify-center border border-white/10 text-white/90"
                onClick={() => setShowPersonalization(true)}
                title="Padrões e Wallpaper"
              >
                <Image size={18} />
              </button>

              <div className="relative group aspect-square">
                <button
                  className="w-full h-full rounded-xl hover:bg-white/20 transition border border-white/10"
                  title="Cor Fundo"
                >
                  <ColorButton icon={Monitor} color={backgroundColor} />
                </button>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <button
                className={`aspect-square rounded-xl transition flex items-center justify-center border border-white/10 ${
                  monospace
                    ? "bg-white text-black"
                    : "hover:bg-white/20 text-white/90"
                }`}
                onClick={() => setMonospace(!monospace)}
                title="Fonte Mono"
              >
                <FileCode size={18} />
              </button>

              <button
                className="aspect-square rounded-xl hover:bg-white/20 transition flex items-center justify-center border border-white/10 text-white/90"
                onClick={toggleDarkMode}
                title="Dark/Light Mode"
              >
                {backgroundColor === "#000000" ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )}
              </button>
            </div>

            {/* Linha 3: Opacidade, Backup e Reset */}
            <div className="grid grid-cols-4 gap-2 w-full">
              {/* Opacidade */}
              <div className="relative flex items-center justify-center aspect-square">
                <button
                  onClick={() => setShowOpacity(!showOpacity)}
                  className={`w-full h-full rounded-xl transition flex items-center justify-center border border-white/10 ${
                    boxOpacity < 1 || showOpacity
                      ? "bg-white/20 text-white shadow-inner"
                      : "hover:bg-white/20 text-white/90"
                  }`}
                  title="Transparência das Boxes"
                >
                  <Ghost size={18} />
                </button>

                {showOpacity && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowOpacity(false)}
                    />
                    <div
                      className="absolute top-full mt-2 left-0 p-3 rounded-xl shadow-xl flex flex-col gap-2 items-center z-50 w-32 animate-in fade-in zoom-in-95 duration-200 border border-white/20"
                      style={{ backgroundColor: boxColor, color: textColor }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={boxOpacity}
                        onChange={(e) => setBoxOpacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-current"
                      />
                      <span className="text-[10px] opacity-80 font-mono">
                        {Math.round(boxOpacity * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Botão de Backup (NOVO) */}
              <button
                onClick={() => setShowBackup(true)}
                className="aspect-square rounded-xl hover:bg-purple-500/80 hover:text-white transition text-white/70 flex items-center justify-center border border-white/10"
                title="Backup Geral"
              >
                <Database size={18} />
              </button>

              {/* Botão de Reset */}
              <button
                onClick={() => {
                  if (window.confirm("Resetar todo o app?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="aspect-square rounded-xl hover:bg-red-500/80 hover:text-white transition text-white/70 flex items-center justify-center border border-white/10"
                title="Resetar App (Apaga Tudo)"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* MENU DE NAVEGAÇÃO */}
          <nav className="flex flex-col gap-2 w-full mt-2">
            {menuItems.map((item) => {
              const isActive = window.location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium w-full text-left group relative overflow-hidden ${
                    isActive
                      ? "bg-white/20 shadow-lg font-bold text-white border border-white/20"
                      : "hover:bg-white/10 text-white/90"
                  }`}
                >
                  <span
                    className={`transition-transform duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* --- AVISO BETA DA DYNA (GATINHA PRETA) --- */}
          {showDyna && (
            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 text-center relative overflow-hidden group animate-in slide-in-from-bottom-2 fade-in duration-500 w-full">
              {/* Botão de Fechar */}
              <button
                onClick={() => setShowDyna(false)}
                className="absolute top-2 right-2 text-white/30 hover:text-red-400 transition p-1 rounded-full hover:bg-white/10 z-10"
                title="Dispensar aviso"
              >
                <X size={12} />
              </button>

              {/* Efeito de brilho ao passar o mouse */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="text-2xl mb-2 animate-bounce cursor-default">
                🐈‍⬛
              </div>

              <p className="text-[10px] text-white/70 leading-relaxed font-medium">
                <span className="text-purple-300 font-bold">Olá!</span> Sou a{" "}
                <strong className="text-white">Dyna</strong>.
                <br />
                Futuramente serei sua assistente virtual aqui.
                <br className="mb-2" />
                Ainda estou aprendendo a caçar bugs nesta versão{" "}
                <span className="text-yellow-400 font-bold">BETA</span>.
                <br />
                <span className="opacity-50 text-[9px]">
                  (Seja paciente, humano)
                </span>
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
