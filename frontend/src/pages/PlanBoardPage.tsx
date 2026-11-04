import { useMemo, useState } from "react";
import { LayoutDashboard, Plus, Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import ShinyText from "@/components/landing/ShinyText";
import { usePlanBoardStore } from "@/store/usePlanBoardStore";
import { CardPool } from "@/components/plan-board/CardPool";
import { BoardBlock } from "@/components/plan-board/BoardBlock";
import { sortSlots, type PlanCard } from "@/utils/planBoard";

export default function PlanBoardPage() {
  const { cards, blocks, slots, addCard, removeCard, addBlock, renameBlock, removeBlock, cloneBlock, addSlot, removeSlot, placeCard, unplaceCard } =
    usePlanBoardStore(useShallow((s) => s));

  const [newBlockTitle, setNewBlockTitle] = useState("");

  // Click-to-place: select a card, then click a free slot. Works where dragging does not (touch).
  const [rawSelectedId, setSelectedId] = useState<string | null>(null);
  const selectedId = cards.some((c) => c.id === rawSelectedId) ? rawSelectedId : null;

  const cardsById = useMemo(() => Object.fromEntries(cards.map((c) => [c.id, c])) as Record<string, PlanCard>, [cards]);
  const placedIds = useMemo(() => new Set(slots.flatMap((s) => (s.cardId ? [s.cardId] : []))), [slots]);
  const pool = useMemo(() => cards.filter((c) => !placedIds.has(c.id)), [cards, placedIds]);

  const createBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (addBlock(newBlockTitle)) setNewBlockTitle("");
  };

  const handleRemoveBlock = (id: string, title: string) => {
    const hasSlots = slots.some((s) => s.blockId === id);
    if (!hasSlots || window.confirm(`Excluir "${title}" e todos os horários dele?`)) removeBlock(id);
  };

  const handlePlace = (cardId: string, slotId: string) => {
    placeCard(cardId, slotId);
    setSelectedId(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-transparent">
      <div className="relative z-10 w-full max-w-[1800px] space-y-10 px-6 pb-40 pt-12 md:px-10" style={{ color: "var(--box-text-color)" }}>
        <header className="flex items-center gap-6">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl shadow-inner"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}
          >
            <LayoutDashboard size={32} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--primary)" }}>
              <Sparkles size={12} /> Planejamento
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              <ShinyText text="Quadro de planejamento" speed={3} />
            </h1>
            <p className="text-sm opacity-60">
              1. Crie suas tasks · 2. Monte blocos de horários (um dia, uma manhã, o que quiser) · 3. Arraste cada task pro horário livre.
            </p>
          </div>
        </header>

        <CardPool
          cards={pool}
          placedCount={placedIds.size}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addCard}
          onRemove={removeCard}
          onDropBack={unplaceCard}
        />

        <section className="box-padrao !h-auto !gap-8 !p-8 !rounded-3xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-xl font-black tracking-tight">Blocos de horários</h2>
              <p className="max-w-xl text-sm opacity-60">
                Cada bloco é o nome que você quiser: um dia da semana, "manhã livre", "sábado de estudo". Dentro dele você define os intervalos.
                Montou um bloco que se repete? Clone.
              </p>
            </div>

            <form onSubmit={createBlock} className="flex flex-wrap items-center gap-3 rounded-2xl bg-current/[0.06] p-3">
              <input
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                placeholder="Título: Segunda, Manhã livre…"
                aria-label="Título do novo bloco"
                maxLength={40}
                className="w-64 rounded-xl bg-current/10 px-5 py-3.5 text-sm font-semibold outline-none transition-colors placeholder:opacity-40 focus:bg-current/[0.16]"
              />
              <button
                type="submit"
                disabled={!newBlockTitle.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:brightness-110 disabled:opacity-30"
              >
                <Plus size={18} /> Bloco
              </button>
            </form>
          </div>

          {blocks.length === 0 ? (
            <p className="rounded-2xl bg-current/[0.04] px-6 py-16 text-center text-sm font-semibold opacity-50">
              Nenhum bloco ainda. Dê um título ali em cima e crie o primeiro ☝️
            </p>
          ) : (
            <div className="flex items-stretch gap-8 overflow-x-auto px-1 pb-6 pt-1">
              {blocks.map((block) => (
                <BoardBlock
                  key={block.id}
                  block={block}
                  slots={sortSlots(slots.filter((s) => s.blockId === block.id))}
                  cardsById={cardsById}
                  selectedId={selectedId}
                  onPlace={handlePlace}
                  onUnplace={unplaceCard}
                  onRemoveSlot={removeSlot}
                  onAddSlot={addSlot}
                  onRename={(title) => renameBlock(block.id, title)}
                  onClone={() => cloneBlock(block.id)}
                  onRemove={() => handleRemoveBlock(block.id, block.title)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
