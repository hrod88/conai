"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface FavoritesState {
  items: Product[];
  toggle: (product: Product) => void;
  isFavorite: (id: string) => boolean;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((s) => ({
          items: s.items.find((p) => p.id === product.id)
            ? s.items.filter((p) => p.id !== product.id)
            : [...s.items, product],
        })),
      isFavorite: (id) => get().items.some((p) => p.id === id),
      count: () => get().items.length,
    }),
    { name: "conai-favorites" }
  )
);
