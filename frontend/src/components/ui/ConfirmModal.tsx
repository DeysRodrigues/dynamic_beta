import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** In-app replacement for `window.confirm`, for actions that cannot be undone. */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Rendered in the body: a widget sits inside a transformed grid cell, which would otherwise
  // make `fixed` relative to the cell instead of the screen.
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-label={title}
        className="w-full max-w-sm bg-[#111] rounded-2xl p-8 shadow-2xl text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{message}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className="py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
