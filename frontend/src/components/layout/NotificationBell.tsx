import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, X } from "lucide-react";
import { APP_UPDATES } from "@/data/updates";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useShallow } from "zustand/react/shallow";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const { lastSeenVersion, markAsSeen } = useNotificationStore(
    useShallow((state) => ({
      lastSeenVersion: state.lastSeenVersion,
      markAsSeen: state.markAsSeen,
    }))
  );

  const hasNewUpdate = lastSeenVersion !== APP_UPDATES.version;

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.right + 15 });
    }
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && hasNewUpdate) markAsSeen(APP_UPDATES.version);
  };

  useEffect(() => {
    if (isOpen) {
      const closeMenu = () => setIsOpen(false);
      setTimeout(() => window.addEventListener("click", closeMenu), 0);
      return () => window.removeEventListener("click", closeMenu);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className="relative p-1 hover:bg-white/10 rounded-full transition-colors group"
      >
        <Bell
          size={20}
          className="text-white/90 group-hover:text-white transition"
        />
        {hasNewUpdate && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary animate-pulse shadow-sm z-10" />
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed w-80 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-0 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-gray-200 font-sans origin-top-left"
            style={{ top: coords.top, left: coords.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 -left-1.5 w-3 h-3 bg-[#1e1e1e] border-l border-b border-white/10 rotate-45 transform" />

            {/* HEADER DINÂMICO */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 relative">
              <div className="flex items-center gap-2 text-white font-bold text-sm pr-6 leading-tight">
                {/* Agora usa o emoji do arquivo */}
                <span className="text-lg">{APP_UPDATES.emoji}</span>
                {APP_UPDATES.title}
              </div>
              <p className="text-[10px] text-white/70 mt-1 font-medium pl-7">
                {APP_UPDATES.date}
              </p>

              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-white/50 hover:text-white transition bg-black/20 hover:bg-black/40 rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* ÁREA DO RECADO (MESSAGE) */}
              {APP_UPDATES.message && (
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm text-gray-300 italic leading-relaxed">
                  {APP_UPDATES.message}
                </div>
              )}

              {/* LISTA DE ITEMS */}
              <div className="space-y-2">
                {APP_UPDATES.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start text-sm leading-relaxed group"
                  >
                    <span className="text-purple-400 mt-0.5 group-hover:scale-125 transition-transform">
                      •
                    </span>
                    <span className="opacity-90">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER DINÂMICO */}
            <div className="p-3 bg-black/20 border-t border-white/5 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest transition"
              >
                {APP_UPDATES.footer || "FECHAR"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
