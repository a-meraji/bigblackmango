import { create } from 'zustand';
import type { Cart } from '@types/cart';
import type { CartItemIssue } from '@utils/cart-item-issues';
import { pruneItemIssues } from '@utils/cart-item-issues';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  itemCount: number;
  total: number;
  itemIssues: Record<string, CartItemIssue>;
  openCart: () => void;
  closeCart: () => void;
  syncCart: (cart: Cart) => void;
  clearCart: () => void;
  setItemIssue: (cartItemId: string, issue: CartItemIssue) => void;
  clearItemIssue: (cartItemId: string) => void;
  setItemIssues: (issues: Record<string, CartItemIssue>) => void;
  hasUnavailableItems: () => boolean;
}

function deriveCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  itemCount: 0,
  total: 0,
  itemIssues: {},

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  syncCart: (cart) =>
    set((state) => ({
      cart,
      itemCount: deriveCount(cart),
      total: cart.total,
      itemIssues: pruneItemIssues(state.itemIssues, cart),
    })),

  clearCart: () =>
    set({ cart: null, itemCount: 0, total: 0, isOpen: false, itemIssues: {} }),

  setItemIssue: (cartItemId, issue) =>
    set((state) => ({
      itemIssues: { ...state.itemIssues, [cartItemId]: issue },
    })),

  clearItemIssue: (cartItemId) =>
    set((state) => {
      const { [cartItemId]: _removed, ...rest } = state.itemIssues;
      return { itemIssues: rest };
    }),

  setItemIssues: (issues) => set({ itemIssues: issues }),

  hasUnavailableItems: () =>
    Object.values(get().itemIssues).some((issue) => issue.type === 'unavailable'),
}));
