import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistConfig, PERSISTED } from "@/persistence/registry";
import { CARD_COLORS, migratePlanBoard, sortSlots, validateSlot, type NewSlot, type PlanBlock, type PlanCard, type PlanSlot, type PlanTemplate } from "@/utils/planBoard";

interface PlanBoardState {
  cards: PlanCard[];
  blocks: PlanBlock[];
  slots: PlanSlot[];
  templates: PlanTemplate[];

  addCard: (title: string, color?: string) => void;
  removeCard: (id: string) => void;

  /** Creates an empty block and returns its id (or null when the title is empty). */
  addBlock: (title: string) => string | null;
  renameBlock: (id: string, title: string) => void;
  /** Removes the block and its intervals; cards that were in them go back to the pool. */
  removeBlock: (id: string) => void;
  /** Copies a block with all its intervals (empty: a card lives in one place only). Returns the new id. */
  cloneBlock: (id: string) => string | null;

  /** Adds an interval. Returns the reason it was refused, or null when it was added. */
  addSlot: (slot: NewSlot) => string | null;
  removeSlot: (id: string) => void;
  /** Puts a card in a free slot. A card lives in one slot only, so this also moves it. */
  placeCard: (cardId: string, slotId: string) => void;
  /** Takes a card out of its slot; it goes back to the pool above. */
  unplaceCard: (cardId: string) => void;

  /** Saves the block's intervals (without cards) as a model. Same title replaces. Returns the reason it was refused, or null. */
  saveTemplate: (blockId: string, title: string) => string | null;
  removeTemplate: (id: string) => void;
  /** Adds the model's intervals to a block, skipping any that clash with what is already there. Returns how many were skipped. */
  applyTemplate: (templateId: string, blockId: string) => number;
  /** Creates a new block already filled with the model. Returns its id. */
  addBlockFromTemplate: (templateId: string) => string | null;
}

export const usePlanBoardStore = create<PlanBoardState>()(
  persist(
    (set, get) => ({
      cards: [],
      blocks: [],
      slots: [],
      templates: [],

      addCard: (title, color) => {
        const clean = title.trim();
        if (!clean) return;
        set((state) => ({
          cards: [
            ...state.cards,
            { id: crypto.randomUUID(), title: clean, color: color ?? CARD_COLORS[state.cards.length % CARD_COLORS.length] },
          ],
        }));
      },

      removeCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
          slots: state.slots.map((s) => (s.cardId === id ? { ...s, cardId: null } : s)),
        })),

      addBlock: (title) => {
        const clean = title.trim();
        if (!clean) return null;
        const id = crypto.randomUUID();
        set((state) => ({ blocks: [...state.blocks, { id, title: clean }] }));
        return id;
      },

      renameBlock: (id, title) => {
        const clean = title.trim();
        if (!clean) return;
        set((state) => ({ blocks: state.blocks.map((b) => (b.id === id ? { ...b, title: clean } : b)) }));
      },

      removeBlock: (id) =>
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
          slots: state.slots.filter((s) => s.blockId !== id),
        })),

      cloneBlock: (id) => {
        const original = get().blocks.find((b) => b.id === id);
        if (!original) return null;
        const newId = crypto.randomUUID();
        set((state) => {
          const index = state.blocks.findIndex((b) => b.id === id);
          const copy: PlanBlock = { id: newId, title: `${original.title} (cópia)` };
          const blocks = [...state.blocks];
          blocks.splice(index + 1, 0, copy); // right next to the original
          const copies = state.slots
            .filter((s) => s.blockId === id)
            .map((s) => ({ ...s, id: crypto.randomUUID(), blockId: newId, cardId: null }));
          return { blocks, slots: [...state.slots, ...copies] };
        });
        return newId;
      },

      addSlot: (slot) => {
        if (!get().blocks.some((b) => b.id === slot.blockId)) return "Esse bloco não existe mais.";
        const error = validateSlot(get().slots, slot);
        if (error) return error;
        const label = slot.kind === "busy" ? slot.label?.trim() || "Ocupado" : undefined;
        set((state) => ({
          slots: [...state.slots, { ...slot, label, id: crypto.randomUUID(), cardId: null }],
        }));
        return null;
      },

      removeSlot: (id) => set((state) => ({ slots: state.slots.filter((s) => s.id !== id) })),

      placeCard: (cardId, slotId) =>
        set((state) => {
          const target = state.slots.find((s) => s.id === slotId);
          if (!target || target.kind !== "free") return state;
          if (!state.cards.some((c) => c.id === cardId)) return state;
          return {
            slots: state.slots.map((s) => {
              if (s.id === slotId) return { ...s, cardId };
              return s.cardId === cardId ? { ...s, cardId: null } : s;
            }),
          };
        }),

      unplaceCard: (cardId) =>
        set((state) => ({
          slots: state.slots.map((s) => (s.cardId === cardId ? { ...s, cardId: null } : s)),
        })),

      saveTemplate: (blockId, title) => {
        const clean = title.trim();
        if (!clean) return "Dê um nome pro modelo.";
        const mine = sortSlots(get().slots.filter((s) => s.blockId === blockId));
        if (mine.length === 0) return "Esse bloco ainda não tem horários pra salvar.";
        const slots = mine.map(({ start, end, kind, label }) => ({ start, end, kind, ...(kind === "busy" ? { label } : {}) }));
        set((state) => {
          const same = state.templates.find((t) => t.title.toLowerCase() === clean.toLowerCase());
          const template: PlanTemplate = { id: same?.id ?? crypto.randomUUID(), title: clean, slots };
          return { templates: same ? state.templates.map((t) => (t === same ? template : t)) : [...state.templates, template] };
        });
        return null;
      },

      removeTemplate: (id) => set((state) => ({ templates: state.templates.filter((t) => t.id !== id) })),

      applyTemplate: (templateId, blockId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template || !get().blocks.some((b) => b.id === blockId)) return 0;
        let skipped = 0;
        const added: PlanSlot[] = [];
        for (const slot of template.slots) {
          const next = { ...slot, blockId };
          if (validateSlot([...get().slots, ...added], next)) {
            skipped++;
            continue;
          }
          added.push({ ...next, id: crypto.randomUUID(), cardId: null });
        }
        if (added.length) set((state) => ({ slots: [...state.slots, ...added] }));
        return skipped;
      },

      addBlockFromTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return null;
        const id = crypto.randomUUID();
        set((state) => ({
          blocks: [...state.blocks, { id, title: template.title }],
          slots: [...state.slots, ...template.slots.map((s) => ({ ...s, blockId: id, id: crypto.randomUUID(), cardId: null }))],
        }));
        return id;
      },
    }),
    {
      ...persistConfig(PERSISTED.planBoard, migratePlanBoard),
    }
  )
);
