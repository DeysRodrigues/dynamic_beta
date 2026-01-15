import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteState {
  favoriteWidgets: string[];
  favoriteThemes: string[];
  
  toggleWidgetFavorite: (id: string) => void;
  toggleThemeFavorite: (id: string) => void;
  
  isWidgetFavorite: (id: string) => boolean;
  isThemeFavorite: (id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteWidgets: [],
      favoriteThemes: [],

      toggleWidgetFavorite: (id) => set((state) => {
        const isFav = state.favoriteWidgets.includes(id);
        return {
          favoriteWidgets: isFav 
            ? state.favoriteWidgets.filter(wId => wId !== id)
            : [...state.favoriteWidgets, id]
        };
      }),

      toggleThemeFavorite: (id) => set((state) => {
        const isFav = state.favoriteThemes.includes(id);
        return {
          favoriteThemes: isFav 
            ? state.favoriteThemes.filter(tId => tId !== id)
            : [...state.favoriteThemes, id]
        };
      }),

      isWidgetFavorite: (id) => get().favoriteWidgets.includes(id),
      isThemeFavorite: (id) => get().favoriteThemes.includes(id),
    }),
    {
      name: 'favorites-storage', // Key no localStorage
    }
  )
);
