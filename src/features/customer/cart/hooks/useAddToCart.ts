import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addItemToCart } from '@features/customer/cart/cart-operations';
import type { GuestCartItemInput } from '@features/customer/cart/guest-cart.types';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { useToast } from '@hooks/useToast';

/**
 * Cart add — guests persist locally; signed-in users use the server cart.
 */
export function useAddToCart() {
  const [addingId, setAddingId] = useState<string | null>(null);
  const syncCart = useCartStore((s) => s.syncCart);
  const openCart = useCartStore((s) => s.openCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toast = useToast();
  const qc = useQueryClient();

  async function addToCart(input: GuestCartItemInput, quantity = 1) {
    setAddingId(input.menuItemId);
    try {
      const cart = await addItemToCart(input, quantity);
      syncCart(cart);
      if (isAuthenticated) {
        qc.setQueryData(['cart'], cart);
      }
      openCart();
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'OUT_OF_STOCK' || apiErr.code === 'INACTIVE_RESOURCE') {
        toast.error('این غذا دیگر در منوی امروز موجود نیست.');
      } else {
        toast.error('خطا در افزودن به سبد. دوباره تلاش کنید.');
      }
    } finally {
      setAddingId(null);
    }
  }

  return { addToCart, addingId };
}
