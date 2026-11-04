import { useState } from "react";
import { Copy, GripVertical, Lock, MousePointerClick, Plus, Trash2, X } from "lucide-react";
import TimePicker from "@/components/ui/TimePicker";
import { cn } from "@/lib/utils";
import {
  crossesMidnight,
  formatDuration,
  slotMinutes,
  type NewSlot,
  type PlanBlock,
  type PlanCard,
  type PlanSlot,
  type SlotKind,
} from "@/utils/planBoard";

interface BoardBlockProps {
  block: PlanBlock;
  slots: PlanSlot[]; // already this block's, sorted by start
  cardsById: Record<string, PlanCard>;
  selectedId: string | null;
  onPlace: (cardId: string, slotId: string) => void;
  onUnplace: (cardId: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onAddSlot: (slot: NewSlot) => string | null;
  onRename: (title: string) => void;
  onClone: () => void;
  onRemove: () => void;
}

// Every block wears the theme's own color: the only varied colors on the board are the task cards.
const ACCENT = "var(--primary)";

const field =
  "w-full rounded-xl bg-current/10 px-3.5 py-3 text-sm font-semibold outline-none transition-colors focus:bg-current/[0.16]";

export function BoardBlock({ block, slots, cardsById, selectedId, onPlace, onUnplace, onRemoveSlot, onAddSlot, onRename, onClone, onRemove }: BoardBlockProps) {
  const [title, setTitle] = useState(block.title);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [kind, setKind] = useState<SlotKind>("free");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const freeMinutes = slots.filter((s) => s.kind === "free").reduce((sum, s) => sum + slotMinutes(s), 0);
  const filled = slots.filter((s) => s.kind === "free" && s.cardId).length;
  const freeCount = slots.filter((s) => s.kind === "free").length;

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = onAddSlot({ blockId: block.id, start, end, kind, label });
    setError(problem);
    if (!problem) {
      setStart("");
      setEnd("");
      setLabel("");
    }
  };

  return (
    <div className="flex min-w-[300px] flex-1 flex-col overflow-hidden rounded-3xl bg-current/[0.09] shadow-xl shadow-black/20">
      <header className="space-y-3 px-5 pb-5 pt-4" style={{ backgroundColor: `color-mix(in srgb, ${ACCENT} 16%, transparent)` }}>
        <div className="flex items-center gap-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => (title.trim() ? onRename(title) : setTitle(block.title))}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label={`Título do bloco ${block.title}`}
            maxLength={40}
            className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-xl font-black tracking-tight outline-none transition-colors hover:bg-current/[0.07] focus:bg-current/10"
          />
          <button type="button" onClick={onClone} aria-label={`Clonar ${block.title}`} title="Clonar este bloco com todos os horários" className="rounded-lg p-2 opacity-40 transition-all hover:bg-primary/15 hover:text-primary hover:opacity-100">
            <Copy size={18} />
          </button>
          <button type="button" onClick={onRemove} aria-label={`Excluir ${block.title}`} title="Excluir bloco" className="rounded-lg p-2 opacity-40 transition-all hover:bg-red-500/15 hover:text-red-400 hover:opacity-100">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 px-1 text-[10px] font-black uppercase tracking-widest">
          <span className={cn("rounded-full px-3 py-1", freeMinutes > 0 ? "bg-primary text-primary-foreground" : "bg-current/10 opacity-50")}>
            {freeMinutes > 0 ? `${formatDuration(freeMinutes)} livres` : "sem horários"}
          </span>
          {freeCount > 0 && (
            <span className="rounded-full bg-current/10 px-3 py-1 opacity-60">
              {filled}/{freeCount} preenchidos
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex flex-1 flex-col gap-3.5 rounded-2xl bg-black/[0.12] p-3.5 shadow-inner">
          {slots.map((slot) => (
            <SlotView
              key={slot.id}
              slot={slot}
              card={slot.cardId ? cardsById[slot.cardId] : undefined}
              canReceive={selectedId !== null}
              onDropCard={(cardId) => onPlace(cardId, slot.id)}
              onClickSlot={() => selectedId && slot.kind === "free" && onPlace(selectedId, slot.id)}
              onUnplace={onUnplace}
              onRemove={() => onRemoveSlot(slot.id)}
            />
          ))}
          {slots.length === 0 && <p className="my-auto px-5 py-8 text-center text-sm opacity-50">Nenhum horário ainda. Adicione o primeiro abaixo.</p>}
        </div>

        {open ? (
          <form onSubmit={submit} className="space-y-4 rounded-2xl bg-current/[0.10] p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="px-1 text-[10px] font-black uppercase tracking-widest opacity-50">Início</span>
                <TimePicker ariaLabel={`Início, ${block.title}`} value={start} onChange={setStart} />
              </label>
              <label className="space-y-1.5">
                <span className="px-1 text-[10px] font-black uppercase tracking-widest opacity-50">Fim</span>
                <TimePicker ariaLabel={`Fim, ${block.title}`} value={end} onChange={setEnd} />
              </label>
            </div>

            <p className="px-1 text-[11px] leading-relaxed opacity-50">
              Fim menor que o início passa da meia-noite: 22:00 até 00:00 são 2h.
            </p>

            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-current/10 p-1.5" role="radiogroup" aria-label="Tipo de intervalo">
              {(["free", "busy"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-lg py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                    kind === k ? "bg-primary text-primary-foreground shadow" : "opacity-50 hover:opacity-100"
                  )}
                >
                  {k === "free" ? "Livre" : "Ocupado"}
                </button>
              ))}
            </div>

            {kind === "busy" && (
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="O que é? Ex.: aula, trabalho" aria-label="Nome do bloco ocupado" maxLength={30} className={field} />
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={close} className="flex-1 rounded-xl bg-current/10 py-3 text-xs font-black uppercase tracking-widest opacity-70 transition-opacity hover:opacity-100">
                Fechar
              </button>
              <button type="submit" aria-label="Adicionar intervalo" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:brightness-110">
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Novo intervalo, ${block.title}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-current/[0.10] py-4 text-xs font-black uppercase tracking-widest opacity-70 transition-all hover:bg-primary/15 hover:text-primary hover:opacity-100"
          >
            <Plus size={16} /> Novo intervalo
          </button>
        )}
      </div>
    </div>
  );
}

interface SlotViewProps {
  slot: PlanSlot;
  card?: PlanCard;
  canReceive: boolean;
  onDropCard: (cardId: string) => void;
  onClickSlot: () => void;
  onUnplace: (cardId: string) => void;
  onRemove: () => void;
}

function SlotView({ slot, card, canReceive, onDropCard, onClickSlot, onUnplace, onRemove }: SlotViewProps) {
  const [over, setOver] = useState(false);
  const isFree = slot.kind === "free";

  // Three clearly different states: a sunken, tinted hole (free), a raised tile in the card's own
  // color (filled), and a flat grey tile (busy).
  const surface = !isFree
    ? "color-mix(in srgb, currentColor 12%, transparent)"
    : card
      ? `color-mix(in srgb, ${card.color} 24%, transparent)`
      : `color-mix(in srgb, ${ACCENT} 13%, transparent)`;

  return (
    <div
      style={{ backgroundColor: surface }}
      onClick={onClickSlot}
      onDragOver={(e) => {
        if (!isFree) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("cardId");
        if (id && isFree) onDropCard(id);
      }}
      className={cn(
        "group relative flex min-h-[8rem] flex-col gap-3 overflow-hidden rounded-2xl p-4 transition-all",
        isFree && !card && "shadow-inner",
        isFree && card && "shadow-lg shadow-black/20",
        !isFree && "opacity-80",
        isFree && canReceive && !card && "cursor-pointer animate-pulse hover:brightness-125",
        over && "scale-[1.03] shadow-xl ring-2 ring-primary"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-base font-black tabular-nums tracking-tight">
            {slot.start} – {slot.end}
          </span>
          <span className="rounded-full bg-current/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest opacity-70">
            {formatDuration(slotMinutes(slot))}
          </span>
          {crossesMidnight(slot) && (
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary" title="Termina no dia seguinte">
              +1 dia
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={`Remover intervalo ${slot.start}–${slot.end}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-current/10 focus:opacity-100 group-hover:opacity-60"
        >
          <X size={16} />
        </button>
      </div>

      {!isFree && (
        <div className="flex flex-1 items-center gap-2.5 text-sm font-bold">
          <Lock size={16} className="opacity-60" />
          {slot.label}
        </div>
      )}

      {isFree && !card && (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-2 text-center opacity-60">
          <MousePointerClick size={20} />
          <span className="text-sm font-bold">{canReceive ? "Clique pra encaixar aqui" : "livre"}</span>
          {!canReceive && <span className="text-xs opacity-70">solte uma task aqui</span>}
        </div>
      )}

      {isFree && card && (
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData("cardId", card.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          className="flex flex-1 cursor-grab items-center justify-between gap-2 rounded-xl py-3 pl-2.5 pr-3 text-sm font-bold text-neutral-900 shadow-lg active:cursor-grabbing"
          style={{ backgroundColor: card.color }}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <GripVertical size={16} className="shrink-0 opacity-40" />
            <span className="truncate">{card.title}</span>
          </span>
          <button
            type="button"
            aria-label={`Tirar ${card.title} do intervalo`}
            onClick={(e) => {
              e.stopPropagation();
              onUnplace(card.id);
            }}
            className="shrink-0 rounded-full p-1 transition-colors hover:bg-black/10"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
