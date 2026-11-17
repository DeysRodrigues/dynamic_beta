import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { dismissDialog, useDialogStore, type DialogRequest } from "@/lib/dialog";

/** Draws the dialogs asked for through confirmDialog / alertDialog / promptDialog. Mount it once. */
export default function DialogHost() {
  const current = useDialogStore((s) => s.queue[0]);

  useEffect(() => {
    useDialogStore.setState((s) => ({ hosts: s.hosts + 1 }));
    return () => useDialogStore.setState((s) => ({ hosts: s.hosts - 1 }));
  }, []);

  if (!current) return null;
  return <Dialog key={current.id} request={current} />;
}

function Dialog({ request }: { request: DialogRequest }) {
  const [text, setText] = useState(request.kind === "prompt" ? request.defaultValue : "");

  const finish = (answer: boolean | string | null) => {
    if (request.kind === "confirm") request.resolve(answer === true);
    else if (request.kind === "prompt") request.resolve(typeof answer === "string" ? answer : null);
    else request.resolve();
    dismissDialog(request.id);
  };

  // Esc backs out. Enter is left to the focused button / form, so it never confirms by accident.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(request.kind === "confirm" ? false : null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  if (request.kind === "confirm") {
    return <ConfirmModal isOpen title={request.title} message={request.message} confirmLabel={request.confirmLabel} onConfirm={() => finish(true)} onCancel={() => finish(false)} />;
  }

  const isPrompt = request.kind === "prompt";
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => finish(isPrompt ? null : true)}>
      <form
        role={isPrompt ? "dialog" : "alertdialog"}
        aria-label={request.title}
        className="w-full max-w-sm bg-[#111] rounded-2xl p-8 shadow-2xl text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          finish(isPrompt ? text : true);
        }}
      >
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
          <Info size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">{request.title}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{request.message}</p>
        </div>

        {request.kind === "prompt" && (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={request.placeholder}
            aria-label={request.message}
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-white/30 focus:bg-white/[0.16]"
          />
        )}

        <div className={isPrompt ? "grid grid-cols-2 gap-2" : ""}>
          {isPrompt && (
            <button type="button" onClick={() => finish(null)} className="py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all active:scale-95">
              Cancelar
            </button>
          )}
          <button type="submit" autoFocus={!isPrompt} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-95">
            {request.kind === "prompt" ? (request.confirmLabel ?? "OK") : "OK"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
