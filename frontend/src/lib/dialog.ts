import { create } from "zustand";

// In-app replacement for window.confirm / alert / prompt. Call sites keep the same shape, they just
// await it: `if (await confirmDialog("Excluir?")) …`. <DialogHost /> (mounted once in App) draws them.

type Request =
  | { kind: "confirm"; title: string; message: string; confirmLabel?: string; resolve: (ok: boolean) => void }
  | { kind: "alert"; title: string; message: string; resolve: () => void }
  | {
      kind: "prompt";
      title: string;
      message: string;
      defaultValue: string;
      placeholder?: string;
      confirmLabel?: string;
      resolve: (value: string | null) => void;
    };

export type DialogRequest = Request & { id: number };

interface DialogState {
  /** Dialogs wait their turn: the first one is the one on screen. */
  queue: DialogRequest[];
  /** How many <DialogHost /> are mounted. With none, there is nobody to draw the dialog. */
  hosts: number;
}

export const useDialogStore = create<DialogState>(() => ({ queue: [], hosts: 0 }));

let nextId = 1;

function enqueue(request: Request) {
  useDialogStore.setState((s) => ({ queue: [...s.queue, { ...request, id: nextId++ } as DialogRequest] }));
}

/** Closes the dialog on screen. Called by the host once the person answered. */
export function dismissDialog(id: number) {
  useDialogStore.setState((s) => ({ queue: s.queue.filter((d) => d.id !== id) }));
}

const hasHost = () => useDialogStore.getState().hosts > 0;

export function confirmDialog(message: string, options: { title?: string; confirmLabel?: string } = {}): Promise<boolean> {
  // No host (a component rendered on its own, in a test): the browser's own box still works.
  if (!hasHost()) return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => enqueue({ kind: "confirm", title: options.title ?? "Tem certeza?", message, confirmLabel: options.confirmLabel, resolve }));
}

export function alertDialog(message: string, options: { title?: string } = {}): Promise<void> {
  if (!hasHost()) {
    window.alert(message);
    return Promise.resolve();
  }
  return new Promise((resolve) => enqueue({ kind: "alert", title: options.title ?? "Aviso", message, resolve }));
}

/** Resolves with the typed text, or null when cancelled. */
export function promptDialog(
  message: string,
  options: { title?: string; defaultValue?: string; placeholder?: string; confirmLabel?: string } = {}
): Promise<string | null> {
  if (!hasHost()) return Promise.resolve(window.prompt(message, options.defaultValue));
  return new Promise((resolve) =>
    enqueue({
      kind: "prompt",
      title: options.title ?? "Digite aqui",
      message,
      defaultValue: options.defaultValue ?? "",
      placeholder: options.placeholder,
      confirmLabel: options.confirmLabel,
      resolve,
    })
  );
}
