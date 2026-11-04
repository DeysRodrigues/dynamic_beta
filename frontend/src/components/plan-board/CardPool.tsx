import { useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_COLORS, type PlanCard } from "@/utils/planBoard";

interface CardPoolProps {
  cards: PlanCard[];
  placedCount: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (title: string, color: string) => void;
  onRemove: (id: string) => void;
  /** A card dragged back from a day lands here and returns to the pool. */
  onDropBack: (cardId: string) => void;
}

export function CardPool({ cards, placedCount, selectedId, onSelect, onAdd, onRemove, onDropBack }: CardPoolProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>(CARD_COLORS[0]);
  const [over, setOver] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, color);
    setTitle("");
  };

  const nothingYet = cards.length === 0 && placedCount === 0;

  return (
    <section
      className={cn("box-padrao !h-auto !gap-8 !p-8 !rounded-3xl", over && "ring-2 ring-primary")}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("cardId");
        if (id) onDropBack(id);
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black tracking-tight">Minhas tasks</h2>
          <p className="max-w-xl text-sm opacity-60">
            Tudo que você precisa fazer, um card pra cada coisa. Depois é só encaixar nos horários livres da semana.
          </p>
        </div>
        <div className="flex gap-3">
          <Pill value={cards.length} label="sem horário" tone="primary" />
          <Pill value={placedCount} label="no quadro" tone="muted" />
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-wrap items-center gap-4 rounded-2xl bg-current/[0.06] p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nova task: lab de DS, estudar inglês, revisar currículo…"
          maxLength={60}
          aria-label="Nome da nova task"
          className="min-w-[240px] flex-1 rounded-xl bg-current/10 px-5 py-3.5 text-sm font-semibold outline-none transition-colors placeholder:opacity-40 focus:bg-current/[0.16]"
        />
        <div className="flex items-center gap-2.5" role="radiogroup" aria-label="Cor do card">
          {CARD_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={`Cor ${c}`}
              onClick={() => setColor(c)}
              className={cn(
                "h-7 w-7 rounded-full transition-all",
                color === c ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-transparent" : "opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:brightness-110 disabled:opacity-30"
        >
          <Plus size={18} /> Card
        </button>
      </form>

      <div className="flex min-h-[7rem] flex-wrap content-start gap-4 rounded-2xl bg-black/[0.12] p-5 shadow-inner">
        {cards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("cardId", card.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => onSelect(selectedId === card.id ? null : card.id)}
            className={cn(
              "group flex cursor-grab items-center gap-2 rounded-2xl py-3.5 pl-3 pr-4 text-sm font-bold text-neutral-900 shadow-lg transition-all active:cursor-grabbing",
              selectedId === card.id ? "-translate-y-1 scale-105 ring-4 ring-primary" : "hover:-translate-y-1"
            )}
            style={{ backgroundColor: card.color }}
            title="Arraste pra um intervalo livre, ou clique e depois clique no intervalo"
          >
            <GripVertical size={16} className="opacity-40" />
            {card.title}
            <button
              type="button"
              aria-label={`Excluir ${card.title}`}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedId === card.id) onSelect(null);
                onRemove(card.id);
              }}
              className="ml-1 rounded-full p-1 opacity-0 transition-opacity hover:bg-black/10 focus:opacity-100 group-hover:opacity-70"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {cards.length === 0 && (
          <p className="m-auto text-sm font-semibold opacity-50">
            {nothingYet ? "Nenhuma task ainda. Crie a primeira acima ☝️" : "Tudo encaixado. Bom trabalho 🌸"}
          </p>
        )}
      </div>
    </section>
  );
}

function Pill({ value, label, tone }: { value: number; label: string; tone: "primary" | "muted" }) {
  return (
    <div className={cn("flex items-baseline gap-2 rounded-2xl px-5 py-3", tone === "primary" ? "bg-primary/15 text-primary" : "bg-current/[0.08]")}>
      <span className="text-2xl font-black leading-none">{value}</span>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
    </div>
  );
}
