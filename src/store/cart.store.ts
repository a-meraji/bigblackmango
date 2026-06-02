import { create } from 'zustand';
import type { Cart } from '@t/cart';
import type { CartItemIssue } from '@utils/cart-item-issues';
import { pruneItemIssues } from '@utils/cart-item-issues';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  /** When true the floating cart bar is temporarily dismissed by the user */
  dismissedFloatingBar: boolean;
  itemCount: number;
  total: number;
  itemIssues: Record<string, CartItemIssue>;
  openCart: () => void;
  closeCart: () => void;
  dismissFloatingBar: () => void;
  resetDismissedFloatingBar: () => void;
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
  dismissedFloatingBar: false,
  itemCount: 0,
  total: 0,
  itemIssues: {},

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  dismissFloatingBar: () => set({ dismissedFloatingBar: true, isOpen: false }),
  resetDismissedFloatingBar: () => set({ dismissedFloatingBar: false }),

  syncCart: (cart) =>
    set((state) => {
      const newCount = deriveCount(cart);
      // If user previously dismissed the floating bar, re-show it when items are added
      const resetDismiss = state.dismissedFloatingBar && newCount > state.itemCount;
      return {
        cart,
        itemCount: newCount,
        total: cart.total,
        itemIssues: pruneItemIssues(state.itemIssues, cart),
        dismissedFloatingBar: resetDismiss ? false : state.dismissedFloatingBar,
      };
    }),

  clearCart: () =>
    set({ cart: null, itemCount: 0, total: 0, isOpen: false, itemIssues: {}, dismissedFloatingBar: false }),

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
