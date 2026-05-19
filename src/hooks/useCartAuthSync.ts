import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCart } from '@api/cart';
import { mergeLocalCartAfterAuth } from '@features/customer/cart/cart-operations';
import { mapGuestCartToCart } from '@features/customer/cart/guest-cart.mapper';
import { getGuestCartItemCount, loadGuestCart } from '@features/customer/cart/guest-cart.storage';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';

/**
 * When the user signs in, merge any guest local cart into the server cart.
 * Also handles the case where auth was restored on boot while local items exist.
 */
export function useCartAuthSync() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncCart = useCartStore((s) => s.syncCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const qc = useQueryClient();
  const wasAuthenticatedRef = useRef(false);
  const bootMergeDoneRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      wasAuthenticatedRef.current = false;
      bootMergeDoneRef.current = false;
      syncCart(mapGuestCartToCart(loadGuestCart()));
      return;
    }

    const shouldMergeOnBoot = !bootMergeDoneRef.current && getGuestCartItemCount() > 0;
    const shouldMergeOnLogin = wasAuthenticatedRef.current === false && getGuestCartItemCount() > 0;

    if (!shouldMergeOnBoot && !shouldMergeOnLogin) {
      wasAuthenticatedRef.current = true;
      bootMergeDoneRef.current = true;
      return;
    }

    let cancelled = false;

    mergeLocalCartAfterAuth()
      .then((cart) => {
        if (cancelled) return;
        syncCart(cart);
        qc.setQueryData(['cart'], cart);
      })
      .catch(() => {
        if (!cancelled) {
          getCart()
            .then((cart) => {
              syncCart(cart);
              qc.setQueryData(['cart'], cart);
            })
            .catch(() => {
              clearCart();
            });
        }
      })
      .finally(() => {
        if (!cancelled) {
          wasAuthenticatedRef.current = true;
          bootMergeDoneRef.current = true;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, syncCart, clearCart, qc]);
}
