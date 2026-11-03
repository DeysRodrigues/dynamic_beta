import { useEffect, useState } from "react";

/**
 * Follows `value`, but only after it has stopped changing for `delay` ms. The first value is
 * returned straight away, so something already saved shows up with no wait.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
