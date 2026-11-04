import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOURS, MINUTES, isFinishedTyping, parseTimeInput } from "@/utils/timeInput";

interface TimePickerProps {
  /** "HH:mm", or "" for no time. */
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  /** Classes for the whole field (the box around the text and the clock button). */
  className?: string;
  /** Show a button that clears the time. */
  clearable?: boolean;
}

const POPOVER_WIDTH = 236;
const POPOVER_HEIGHT = 330;

/**
 * Time field that follows the app's theme, unlike the browser's own `<input type="time">`.
 * Type it ("2200", "22:00", "930") or open the clock and pick an hour and a minute.
 * The list opens in a portal, so no panel with `overflow: hidden` can cut it off.
 */
export default function TimePicker({ value, onChange, ariaLabel, placeholder = "--:--", className, clearable = false }: TimePickerProps) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // The text follows the value when it changes from outside (cleared after a submit, picked in the list).
  useEffect(() => setDraft(value), [value]);

  const [hour, minute] = value ? value.split(":") : ["", ""];

  const place = useCallback(() => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8));
    const fitsBelow = window.innerHeight - rect.bottom >= POPOVER_HEIGHT;
    setPos(fitsBelow ? { left, top: rect.bottom + 6 } : { left, bottom: window.innerHeight - rect.top + 6 });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (fieldRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onMove = (e: Event) => {
      if (popRef.current?.contains(e.target as Node)) return; // scrolling the lists themselves
      place();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  // Brings the chosen hour and minute into view when the list opens.
  useEffect(() => {
    if (!open || !pos) return;
    popRef.current?.querySelectorAll<HTMLElement>('[aria-pressed="true"]').forEach((el) => el.scrollIntoView?.({ block: "center" }));
  }, [open, pos]);

  const handleChange = (text: string) => {
    setDraft(text);
    if (text.trim() === "") return onChange("");
    if (isFinishedTyping(text)) {
      const parsed = parseTimeInput(text);
      if (parsed) onChange(parsed);
    }
  };

  const commit = () => {
    const parsed = parseTimeInput(draft, true);
    if (parsed) onChange(parsed);
    setDraft(parsed ?? value); // something that is not a time goes back to the last good one
  };

  const pick = (h: string, m: string) => onChange(`${h}:${m}`);

  const choice = "flex h-9 w-full items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-colors";

  return (
    <div ref={fieldRef} className={cn("flex items-center rounded-xl bg-current/10 transition-colors focus-within:bg-current/[0.16]", className)}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={5}
        value={draft}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && open) setOpen(false);
          if (e.key === "ArrowDown") setOpen(true);
        }}
        className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm font-semibold tabular-nums outline-none placeholder:opacity-40"
      />
      {clearable && value && (
        <button type="button" aria-label="Limpar horário" onClick={() => onChange("")} className="rounded p-1 opacity-40 hover:bg-current/10 hover:opacity-100">
          <X size={14} />
        </button>
      )}
      <button
        type="button"
        aria-label={`Escolher horário: ${ariaLabel}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn("mr-1.5 rounded-lg p-2 transition-colors hover:bg-current/10", open ? "text-primary" : "opacity-50 hover:opacity-100")}
      >
        <Clock size={16} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Escolher horário"
            className="fixed z-[1000] rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: POPOVER_WIDTH,
              backgroundColor: "var(--box-color, #ffffff)",
              color: "var(--box-text-color, #1e293b)",
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Hora</p>
                <div className="flex h-60 flex-col gap-1 overflow-y-auto rounded-xl bg-current/[0.06] p-1.5">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={h === hour}
                      aria-label={`${h} horas`}
                      onClick={() => pick(h, minute || "00")}
                      className={cn(choice, h === hour ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-current/10")}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Min</p>
                <div className="flex h-60 flex-col gap-1 overflow-y-auto rounded-xl bg-current/[0.06] p-1.5">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={m === minute}
                      aria-label={`${m} minutos`}
                      onClick={() => {
                        pick(hour || "00", m);
                        setOpen(false);
                      }}
                      className={cn(choice, m === minute ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-current/10")}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-center text-[10px] opacity-40">Ou digite: 2200, 22:00, 930</p>
          </div>,
          document.body
        )}
    </div>
  );
}
