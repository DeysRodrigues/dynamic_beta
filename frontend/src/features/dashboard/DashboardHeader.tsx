import React from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Eye, EyeOff, Lock, Moon, Sun, Unlock } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useUserStore } from "@/store/useUserStore";
import { getFormattedCurrentDate } from "@/utils/DateUtils";
import { DEFAULT_AVATAR } from "@/lib/defaultAvatar";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/landing/ShinyText";
import { AddWidgetMenu } from "./AddWidgetMenu";
import { WorkspaceTabs } from "./WorkspaceTabs";

interface DashboardHeaderProps {
  onSave: () => void;
  editMode: boolean;
  toggleEditMode: () => void;
  onAddWidget: (type: string) => void;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Bom dia", icon: <Sun size={14} className="text-orange-400" /> };
  if (hour < 18) return { text: "Boa tarde", icon: <Sun size={14} className="text-amber-500" /> };
  return { text: "Boa noite", icon: <Moon size={14} className="text-indigo-400" /> };
}

export const DashboardHeader = React.memo(
  ({ onSave, editMode, toggleEditMode, onAddWidget }: DashboardHeaderProps) => {
    const navigate = useNavigate();
    const { name, avatar } = useUserStore(
      useShallow((state) => ({ name: state.name, avatar: state.avatar }))
    );
    const { isFocusMode, toggleFocusMode } = useDashboardStore(
      useShallow((s) => ({
        isFocusMode: s.isFocusMode,
        toggleFocusMode: s.toggleFocusMode,
      }))
    );
    const greeting = getGreeting();

    // Keyboard: F toggles focus mode, Escape leaves it.
    React.useEffect(() => {
      const handleKeys = (e: KeyboardEvent) => {
        if (
          e.key.toLowerCase() === "f" &&
          !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
        ) {
          toggleFocusMode();
        }
        if (e.key === "Escape" && isFocusMode) toggleFocusMode();
      };
      window.addEventListener("keydown", handleKeys);
      return () => window.removeEventListener("keydown", handleKeys);
    }, [isFocusMode, toggleFocusMode]);

    return (
      <div
        className={`flex flex-col gap-4 mb-8 transition-all duration-500 relative z-50 ${isFocusMode ? "opacity-30 hover:opacity-100" : ""
          }`}
        style={{ color: "var(--box-text-color)" }}
      >
        {/* Row 1: Greeting & Controls */}
        <div className="flex items-center justify-between gap-2">
          {isFocusMode ? (
            <button
              onClick={toggleFocusMode}
              className="bg-amber-500/20 text-amber-500 p-2.5 rounded-xl flex items-center gap-2 text-xs font-black animate-pulse hover:bg-amber-500 hover:text-white transition shadow-lg shadow-amber-500/10 uppercase tracking-tighter"
            >
              <EyeOff size={16} /> SAIR DO FOCO
            </button>
          ) : (
            <>
              {/* Avatar & Greeting */}
              <div className="flex items-center gap-3 sm:gap-4 animate-in slide-in-from-left-2 duration-300 min-w-0">
                <div className="relative shrink-0 ml-14 md:ml-0 group cursor-pointer" onClick={() => navigate("/wiki")}>
                  <img
                    src={avatar || DEFAULT_AVATAR}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-xl border-2 border-current/10 group-hover:border-primary transition-all duration-500"
                    alt="Avatar"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full shadow-md">
                    {greeting.icon}
                  </div>
                </div>
                <div className="min-w-0 hidden xs:block">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">
                    Dashboard • {getFormattedCurrentDate()}
                  </div>
                  <h1 className="text-base sm:text-xl font-black leading-tight truncate tracking-tight">
                    {greeting.text},{" "}
                    <ShinyText text={name.split(" ")[0]} disabled={false} speed={3} className="text-primary" />
                  </h1>
                </div>
              </div>

              {/* Controls Group */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-md border transition-colors duration-500"
                   style={{ 
                      backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
                   }}>
                <button
                  onClick={toggleFocusMode}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    isFocusMode ? "bg-primary text-primary-foreground shadow-lg" : "opacity-40 hover:opacity-100 hover:bg-current/10"
                  )}
                  title="Modo Foco (F)"
                >
                  {isFocusMode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  onClick={toggleEditMode}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    editMode
                      ? "bg-amber-500/20 text-amber-600 shadow-inner ring-1 ring-amber-500/30"
                      : "opacity-40 hover:opacity-100 hover:bg-current/10"
                  )}
                  title="Editar Layout"
                >
                  {editMode ? <Unlock size={18} /> : <Lock size={18} />}
                </button>

                <div className="w-px h-5 mx-1 opacity-10" style={{ backgroundColor: 'var(--box-text-color)' }}></div>

                <AddWidgetMenu onAddWidget={onAddWidget} onBackup={onSave} />
              </div>
            </>
          )}
        </div>

        {/* Row 2: Tabs (Centered on desktop, scrollable on mobile) */}
        {!isFocusMode && (
          <div className="w-full flex justify-center animate-in slide-in-from-bottom-2 duration-500">
            <WorkspaceTabs />
          </div>
        )}
      </div>
    );
  }
);
