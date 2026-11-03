/**
 * A tiny channel for "a persisted store could not be read". It lives apart from the stores so the
 * registry can report into it without importing them, which would be a cycle.
 */
type Listener = (message: string) => void;
const listeners = new Set<Listener>();

export function reportHydrationError(key: string, error: unknown) {
  const reason = error instanceof Error ? error.message : String(error);
  for (const listener of listeners) listener(`${key}: ${reason}`);
}

export function onHydrationError(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
