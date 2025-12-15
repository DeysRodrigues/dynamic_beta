import { useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Calendar as CalIcon,
} from "lucide-react";
import { useBoxContentStore } from "@/store/useBoxContentStore";

interface PresenceEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  presences: string[];
  absences: string[];
  color: string;
}

const COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
];
const DAYS_LABEL = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function PresenceCalendarBox({
  id = "presence-default",
}: {
  id?: string;
}) {
  const { setBoxContent, getBoxContent } = useBoxContentStore();
  const saved = getBoxContent(id);

  const [events, setEvents] = useState<PresenceEvent[]>(saved.events || []);
  // Proteção: garante que se não houver activeEventId, pega o primeiro ou string vazia
  const [activeEventId, setActiveEventId] = useState<string>(
    saved.activeEventId || events[0]?.id || ""
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const save = (newEvents: PresenceEvent[], newActiveId?: string) => {
    setEvents(newEvents);
    const active = newActiveId !== undefined ? newActiveId : activeEventId;
    setActiveEventId(active);
    setBoxContent(id, { events: newEvents, activeEventId: active });
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  const addEvent = () => {
    if (!title || !start || !end || selectedDays.length === 0)
      return alert("Preencha tudo!");

    const newEvent: PresenceEvent = {
      id: crypto.randomUUID(),
      title,
      startDate: start,
      endDate: end,
      daysOfWeek: selectedDays,
      presences: [],
      absences: [],
      color: COLORS[events.length % COLORS.length],
    };

    const updated = [...events, newEvent];
    save(updated, newEvent.id);
    setIsAdding(false);

    setTitle("");
    setStart("");
    setEnd("");
    setSelectedDays([]);
  };

  const deleteEvent = (e: React.MouseEvent, evtId: string) => {
    e.stopPropagation();
    if (confirm("Apagar este evento?")) {
      const updated = events.filter((e) => e.id !== evtId);
      save(updated, updated[0]?.id || "");
    }
  };

  const toggleStatus = (dateStr: string) => {
    const updated = events.map((evt) => {
      if (evt.id !== activeEventId) return evt;

      // PROTEÇÃO CONTRA CRASH (Dados antigos podem ser undefined)
      const currentPresences = evt.presences || [];
      const currentAbsences = evt.absences || [];

      const isPresent = currentPresences.includes(dateStr);
      const isAbsent = currentAbsences.includes(dateStr);

      let newPresences = [...currentPresences];
      let newAbsences = [...currentAbsences];

      if (!isPresent && !isAbsent) {
        newPresences.push(dateStr);
      } else if (isPresent) {
        newPresences = newPresences.filter((d) => d !== dateStr);
        newAbsences.push(dateStr);
      } else if (isAbsent) {
        newAbsences = newAbsences.filter((d) => d !== dateStr);
      }

      return { ...evt, presences: newPresences, absences: newAbsences };
    });
    save(updated);
  };

  // --- LÓGICA DE DATA ---
  const activeEvent = events.find((e) => e.id === activeEventId);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const isDateValidForEvent = (day: number, evt: PresenceEvent) => {
    const dateObj = new Date(year, month, day);
    const localDateStr = new Date(
      dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    const isWithinRange =
      localDateStr >= evt.startDate && localDateStr <= evt.endDate;

    // PROTEÇÃO CONTRA CRASH: (evt.daysOfWeek || [])
    const isCorrectDayOfWeek = (evt.daysOfWeek || []).includes(
      dateObj.getDay()
    );

    return {
      isValid: isWithinRange && isCorrectDayOfWeek,
      dateStr: localDateStr,
    };
  };

  return (
    <div className="box-padrao p-0 flex flex-col relative overflow-hidden h-full">
      {/* HEADER */}
      <div className="p-2 bg-current/5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {events.map((evt) => (
          <button
            key={evt.id}
            onClick={() => setActiveEventId(evt.id)}
            className={`
              relative px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all group
              ${
                activeEventId === evt.id
                  ? "bg-white shadow-sm text-black"
                  : "bg-transparent opacity-50 hover:opacity-100 hover:bg-current/5"
              }
            `}
          >
            <div className={`w-2 h-2 rounded-full ${evt.color}`} />
            {evt.title}
            {activeEventId === evt.id && (
              <div
                onClick={(e) => deleteEvent(e, evt.id)}
                className="ml-1 opacity-20 hover:opacity-100 hover:text-red-500 cursor-pointer"
              >
                <X size={12} />
              </div>
            )}
          </button>
        ))}
        <button
          onClick={() => setIsAdding(true)}
          className="p-1.5 rounded-lg bg-current/5 hover:bg-current/10 text-primary transition shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      {isAdding ? (
        <div className="p-4 space-y-3 animate-in slide-in-from-top-2 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold uppercase opacity-60">
            Novo Evento
          </h3>
          <input
            className="w-full text-sm p-2 rounded bg-black/5 outline-none"
            placeholder="Nome (Ex: Cálculo II)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold opacity-50">Início</label>
              <input
                type="date"
                className="w-full text-xs p-2 rounded bg-black/5 outline-none"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold opacity-50">Fim</label>
              <input
                type="date"
                className="w-full text-xs p-2 rounded bg-black/5 outline-none"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold opacity-50 mb-1 block">
              Dias de Ocorrência
            </label>
            <div className="flex justify-between gap-1">
              {DAYS_LABEL.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDaySelection(i)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    selectedDays.includes(i)
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 py-2 text-xs font-bold opacity-60 hover:opacity-100"
            >
              Cancelar
            </button>
            <button
              onClick={addEvent}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90"
            >
              Salvar
            </button>
          </div>
        </div>
      ) : activeEvent ? (
        <div className="flex-1 flex flex-col p-4 min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <span className="font-bold text-sm capitalize">
              {currentDate.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-current/10 rounded"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-current/10 rounded"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center content-start overflow-y-auto custom-scrollbar flex-1 pb-2">
            {/* CORREÇÃO DO AVISO DE CHAVES DUPLICADAS: Usando o índice (i) como chave */}
            {DAYS_LABEL.map((d, i) => (
              <span key={i} className="text-[10px] font-bold opacity-40 mb-2">
                {d}
              </span>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { isValid, dateStr } = isDateValidForEvent(
                day,
                activeEvent
              );

              // PROTEÇÃO NOVAMENTE
              const presences = activeEvent.presences || [];
              const absences = activeEvent.absences || [];

              const isPresent = presences.includes(dateStr);
              const isAbsent = absences.includes(dateStr);
              const isToday =
                new Date().toDateString() ===
                new Date(year, month, day).toDateString();

              return (
                <div
                  key={day}
                  className="flex items-center justify-center relative group h-8"
                >
                  {isValid ? (
                    <button
                      onClick={() => toggleStatus(dateStr)}
                      className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all shadow-sm
                          ${
                            isPresent
                              ? `${activeEvent.color} text-white scale-100`
                              : isAbsent
                              ? "bg-red-500 text-white scale-100"
                              : "bg-current/5 hover:bg-primary/10 text-current/60 hover:scale-105"
                          }
                          ${
                            isToday && !isPresent && !isAbsent
                              ? "ring-2 ring-primary ring-offset-2"
                              : ""
                          }
                        `}
                      title={dateStr}
                    >
                      {isPresent && <Check size={14} strokeWidth={4} />}
                      {isAbsent && <X size={14} strokeWidth={4} />}
                      {!isPresent && !isAbsent && day}
                    </button>
                  ) : (
                    <span className="text-xs opacity-20 cursor-default">
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-3 grid grid-cols-2 gap-2 text-[10px] shrink-0">
            <div className="bg-emerald-500/10 text-emerald-600 rounded px-2 py-1.5 flex justify-between items-center font-bold">
              <span>Presenças</span>
              {/* PROTEÇÃO AQUI TAMBÉM */}
              <span>{(activeEvent.presences || []).length}</span>
            </div>
            <div className="bg-red-500/10 text-red-600 rounded px-2 py-1.5 flex justify-between items-center font-bold">
              <span>Faltas</span>
              <span>{(activeEvent.absences || []).length}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full opacity-40 gap-2">
          <CalIcon size={32} />
          <p className="text-xs text-center">
            Crie um evento para
            <br />
            controlar sua frequência.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-primary text-xs font-bold underline"
          >
            Criar Agora
          </button>
        </div>
      )}
    </div>
  );
}
