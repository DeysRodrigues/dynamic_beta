import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: ReactNode;
  /** A button or link offered to get out of the empty state. */
  action?: ReactNode;
  className?: string;
}

/**
 * The one look for "nothing here yet": a soft filled panel, never an outline. It takes its
 * colors from the surrounding text, so it works on any theme.
 */
export function EmptyState({ icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center gap-2 rounded-2xl bg-current/5 p-8", className)}>
      {icon && <div className="p-4 rounded-full bg-current/5 opacity-40 mb-1">{icon}</div>}
      <p className="font-bold text-sm opacity-70">{title}</p>
      {hint && <p className="text-xs opacity-50 max-w-[220px]">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
