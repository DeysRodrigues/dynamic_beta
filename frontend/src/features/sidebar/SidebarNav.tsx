import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  icon?: ReactNode;
  path: string;
}

export function SidebarNav({ items }: { items: SidebarItem[] }) {
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  return (
    <nav className="flex-1 w-full space-y-2">
      {items.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden",
              isActive
                ? "bg-white/10 text-white shadow-inner font-bold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" />
            )}
            <span
              className={cn(
                "transition-transform duration-300",
                isActive
                  ? "scale-110 text-primary"
                  : "group-hover:scale-110"
              )}
            >
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
