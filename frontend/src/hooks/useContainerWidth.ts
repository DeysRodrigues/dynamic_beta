import { useLayoutEffect, useRef, useState } from "react";

/**
 * The width of an element, measured before the first paint and kept up to date on resize.
 *
 * `width` is `null` until the first measurement, which happens in a layout effect, so the user
 * never sees a frame drawn at a guessed width. Attach `ref` to the element and draw nothing
 * that depends on the width while it is `null`.
 */
export function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    setWidth(element.offsetWidth);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
