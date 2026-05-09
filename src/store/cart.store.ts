import { create } from 'zustand';

interface CartState {
  isOpen: boolean;
  itemCount: number;
  total: number;
  openCart: () => void;
  closeCart: () => void;
  setCartSummary: (itemCount: number, total: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  itemCount: 0,
  total: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  setCartSummary: (itemCount, total) => set({ itemCount, total }),

  clearCart: () => set({ itemCount: 0, total: 0, isOpen: false }),
}));
