import { useEffect } from 'react';
import { hydrateCartFromSource } from '@features/customer/cart/cart-operations';
import { getGuestCartItemCount, loadGuestCart } from '@features/customer/cart/guest-cart.storage';
import { mapGuestCartToCart } from '@features/customer/cart/guest-cart.mapper';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';

/** Hydrate cart after auth boot: local storage for guests, API for signed-in users. */
export function useCartInit() {
  const syncCart = useCartStore((s) => s.syncCart);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && getGuestCartItemCount() > 0) {
      return;
    }

    hydrateCartFromSource()
      .then(syncCart)
      .catch(() => {
        if (!isAuthenticated) {
          syncCart(mapGuestCartToCart(loadGuestCart()));
        }
      });
  }, [isLoading, isAuthenticated, syncCart]);
}
