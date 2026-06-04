import React, { useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  variant?: "default" | "inline";
  align?: "left" | "right";
}

export default function CustomDatePicker({ 
  value, 
  onChange, 
  label, 
  className, 
  placeholder = "Selecionar data...",
  variant = "default",
  align = "left"
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? parseISO(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : null;

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(addMonths(viewDate, 1));
  };

  const handleSelectDate = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Gerar dias do calendário
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className={cn("relative", variant === "default" ? "w-full" : "w-auto", className)} ref={containerRef}>
      {label && variant === "default" && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-1 mb-1.5 block">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "transition-all cursor-pointer flex items-center justify-between",
          variant === "default" 
            ? "w-full bg-current/[0.07] rounded-xl px-4 py-3 font-bold hover:bg-current/[0.1]" 
            : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded-lg gap-2",
          isOpen && variant === "default" && "bg-current/[0.1]"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon size={variant === "default" ? 16 : 14} className={cn(
            "shrink-0",
            variant === "default" ? "opacity-40" : (selectedDate && format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') ? "text-primary animate-pulse" : "opacity-50")
          )} />
          <span className={cn(
            variant === "default" ? "text-xs" : "text-[10px] font-mono font-bold opacity-80",
            !selectedDate && "opacity-20"
          )}>
            {selectedDate 
              ? (variant === "default" 
                  ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) 
                  : (isSameDay(selectedDate, new Date()) ? "Hoje" : format(selectedDate, "dd/MM")))
              : placeholder}
          </span>
        </div>
        
        {selectedDate && variant === "default" && (
          <button 
            onClick={clearDate}
            className="ml-2 p-0.5 hover:bg-current/10 rounded transition-colors opacity-40 hover:opacity-100"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={cn(
          "absolute mt-1.5 z-[100] p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200 w-[240px]",
          align === "right" ? "right-0" : "left-0"
        )}
             style={{ 
               backgroundColor: 'var(--box-color, #ffffff)', 
               color: 'var(--box-text-color, #1e293b)',
               backdropFilter: 'blur(20px)'
             }}>
          
          {/* Header do Calendário */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-tighter text-[11px]">
              {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="flex gap-0.5">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-current/10 rounded-lg transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-current/10 rounded-lg transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[8px] font-black text-center opacity-30 uppercase">{d}</span>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((date, i) => {
              const isCurrentMonth = isSameMonth(date, monthStart);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={i}
                  onClick={() => handleSelectDate(date)}
                  className={cn(
                    "h-7 w-full rounded-lg text-[10px] font-bold transition-all flex items-center justify-center relative",
                    !isCurrentMonth && "opacity-10",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105 z-10" 
                      : "hover:bg-current/10",
                    isToday && !isSelected && "text-primary after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                  )}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
