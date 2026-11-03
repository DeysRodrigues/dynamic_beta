import { useEffect, useState, type ReactNode } from "react";
import { useHydration, rehydrateAll } from "@/persistence/hydration";

/** How long to wait before saying "loading": a read that is quick should not flash a message. */
const SHOW_LOADING_AFTER_MS = 300;

/**
 * Holds its children back until every persisted store has read its data.
 *
 * With `localStorage` that is already true on the first render, so this is invisible. With a
 * slow adapter it is what keeps the screen from drawing the default widgets and then jumping to
 * the real ones, and what keeps a widget from seeding its state from empty content.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydration((state) => state.hydrated);
  const error = useHydration((state) => state.error);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const timer = setTimeout(() => setSlow(true), SHOW_LOADING_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [hydrated]);

  if (error) {
    return (
      <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-[var(--background-color)] text-[var(--box-text-color)]">
        <p className="font-bold">Não consegui carregar seus dados.</p>
        <p className="text-sm opacity-60 max-w-md">Nada foi apagado nem sobrescrito. Verifique a conexão e tente de novo.</p>
        <button onClick={() => void rehydrateAll()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!hydrated) {
    return slow ? (
      <div role="status" className="min-h-screen flex items-center justify-center text-sm opacity-60 bg-[var(--background-color)] text-[var(--box-text-color)]">
        Carregando seus dados...
      </div>
    ) : null;
  }

  return <>{children}</>;
}
