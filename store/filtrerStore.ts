import { create } from "zustand";

export type PropertyType = "apartment" | "house" | "villa" | "studio" | null;
export type TransactionFilter = "sale" | "rent" | null;

interface FiltrerState {
  search: string;
  type: PropertyType;
  transactionType: TransactionFilter;
  bedrooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  isFurnished: boolean;
  hasGenerator: boolean;
  hasInternet: boolean;
  hasGuardian: boolean;
  isGated: boolean;

  setSearch: (value: string) => void;
  setType: (value: PropertyType) => void;
  setTransactionType: (value: TransactionFilter) => void;
  setBedrooms: (value: number | null) => void;
  setMinPrice: (value: number | null) => void;
  setMaxPrice: (value: number | null) => void;
  setIsFurnished: (value: boolean) => void;
  setHasGenerator: (value: boolean) => void;
  setHasInternet: (value: boolean) => void;
  setHasGuardian: (value: boolean) => void;
  setIsGated: (value: boolean) => void;
  resetFilters: () => void;
}
export const useFilterStore = create<FiltrerState>((set) => ({
  search: "",
  type: null,
  transactionType: null,
  bedrooms: null,
  minPrice: null,
  maxPrice: null,
  isFurnished: false,
  hasGenerator: false,
  hasInternet: false,
  hasGuardian: false,
  isGated: false,

  setSearch: (value) => set({ search: value }),
  setType: (value) => set({ type: value }),
  setTransactionType: (value) => set({ transactionType: value }),
  setBedrooms: (value) => set({ bedrooms: value }),
  setMinPrice: (value) => set({ minPrice: value }),
  setMaxPrice: (value) => set({ maxPrice: value }),
  setIsFurnished: (value) => set({ isFurnished: value }),
  setHasGenerator: (value) => set({ hasGenerator: value }),
  setHasInternet: (value) => set({ hasInternet: value }),
  setHasGuardian: (value) => set({ hasGuardian: value }),
  setIsGated: (value) => set({ isGated: value }),

  resetFilters: () =>
    set({
      search: "",
      type: null,
      transactionType: null,
      bedrooms: null,
      minPrice: null,
      maxPrice: null,
      isFurnished: false,
      hasGenerator: false,
      hasInternet: false,
      hasGuardian: false,
      isGated: false,
    }),
}));
