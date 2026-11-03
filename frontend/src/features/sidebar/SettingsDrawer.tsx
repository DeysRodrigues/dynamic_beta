import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Brush, Check, Database, Droplets, FileCode, Ghost, Image, LayoutTemplate, Moon,
  PaintBucket, BoxSelect, RotateCcw, Settings, Sparkles, Sun, SunMedium, Type, X,
} from "lucide-react";
import PersonalizationModal from "@/components/layout/modals/PersonalizationModal";
import GeneralBackupModal from "@/components/layout/modals/GeneralBackupModal";
import { useThemeStore } from "@/store/useThemeStore";
import { clearAppData } from "@/persistence/backup";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useSession } from "@/sync/session";
import { AccountSummary } from "@/features/account/AccountSummary";
import { ColorPicker } from "./ColorPicker";
import { SettingsSlider } from "./SettingsSlider";

export const SettingsDrawer = ({ onClose }: { onClose: () => void }) => {
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
    glassEffect,
    setGlassEffect,
    wallpaperBlur,
    setWallpaperBlur,
    wallpaperBrightness,
    setWallpaperBrightness,
  } = useThemeStore(useShallow((state) => ({ ...state })));

  const [monospace, setMonospace] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const connected = useSession((s) => !!s.token);

  useEffect(() => {
    if (monospace)
      document.body.style.setProperty(
        "font-family",
        "'Cascadia Mono', 'Courier New', monospace",
        "important"
      );
    else document.body.style.removeProperty("font-family");
  }, [monospace]);

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
      {/* Transparent click area that closes the drawer */}
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />

      <div className="h-full w-80 bg-[#09090b]/95 backdrop-blur-xl shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300 flex flex-col text-white">
        <div className="p-5 flex justify-between items-center bg-white/5">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Personalizar
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
          <AccountSummary onNavigate={onClose} />

          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Ambiente</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-xs font-medium text-white/80 hover:text-white"
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
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-xs font-medium text-white/80 hover:text-white"
              >
                <Image size={14} className="text-blue-400" />
                <span>Fundo</span>
              </button>
            </div>
            <SettingsSlider
              icon={<Ghost size={14} />}
              label="Transparência"
              value={boxOpacity}
              min={0.2}
              max={1}
              step={0.05}
              onChange={setBoxOpacity}
            />
            <SettingsSlider
              icon={<Sparkles size={14} />}
              label="Efeito Glass"
              value={glassEffect}
              min={0}
              max={20}
              step={1}
              onChange={setGlassEffect}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Ajustes do Fundo</h3>
            <SettingsSlider
              icon={<Droplets size={14} className="text-cyan-400" />}
              label="Desfoque"
              value={wallpaperBlur}
              min={0}
              max={20}
              step={1}
              onChange={setWallpaperBlur}
            />
            <SettingsSlider
              icon={<SunMedium size={14} className="text-amber-400" />}
              label="Brilho"
              value={wallpaperBrightness}
              min={0}
              max={200}
              step={5}
              onChange={setWallpaperBrightness}
            />
          </section>

          {/* 2. Detailed colors */}
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
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-xs font-medium ${monospace
                ? "bg-primary/10 text-primary"
                : "bg-white/5 text-white/60 hover:text-white"
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
                className="py-2.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 text-[10px] font-bold transition flex items-center justify-center gap-1.5"
              >
                <Database size={14} /> Backup
              </button>
              <button
                onClick={() => setConfirmReset(true)}
                className="py-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 text-[10px] font-bold transition flex items-center justify-center gap-1.5"
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
        <ConfirmModal
          isOpen={confirmReset}
          title="Resetar tudo?"
          message={
            connected
              ? "Isso apaga os dados deste navegador: tarefas, widgets, projetos e tema. A cópia no servidor NÃO é apagada, então ao recarregar ela volta pra cá. Para só arrumar os widgets, use a página Conta. Faça um backup antes se precisar."
              : "Isso apaga todos os dados do app neste navegador: tarefas, widgets, projetos e tema. Faça um backup antes se precisar."
          }
          confirmLabel="Resetar"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            clearAppData();
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};