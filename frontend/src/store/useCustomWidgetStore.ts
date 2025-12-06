import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomWidget {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
  updatedAt: string;
}

interface CustomWidgetState {
  widgets: CustomWidget[];
  saveWidget: (widget: CustomWidget) => void;
  deleteWidget: (id: string) => void;
  getWidget: (id: string) => CustomWidget | undefined;
}

export const useCustomWidgetStore = create<CustomWidgetState>()(
  persist(
    (set, get) => ({
      widgets: [],

      saveWidget: (widget) =>
        set((state) => {
          const exists = state.widgets.find((w) => w.id === widget.id);
          if (exists) {
            return {
              widgets: state.widgets.map((w) => (w.id === widget.id ? widget : w)),
            };
          }
          return { widgets: [...state.widgets, widget] };
        }),

      deleteWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),

      getWidget: (id) => get().widgets.find((w) => w.id === id),
    }),
    { name: "custom-widgets-storage" }
  )
);