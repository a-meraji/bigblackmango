import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  hydrateCartFromSource,
  validateCurrentCart,
} from '@features/customer/cart/cart-operations';
import { mapGuestCartToCart } from '@features/customer/cart/guest-cart.mapper';
import { loadGuestCart } from '@features/customer/cart/guest-cart.storage';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { issuesFromValidationChanges } from '@utils/cart-item-issues';

export function useCart() {
  const syncCart = useCartStore((s) => s.syncCart);
  const setItemIssues = useCartStore((s) => s.setItemIssues);
  const isOpen = useCartStore((s) => s.isOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useCartStore((s) => s.cart);

  const query = useQuery({
    queryKey: ['cart', isAuthenticated],
    queryFn: hydrateCartFromSource,
    staleTime: 0,
    enabled: isOpen && isAuthenticated,
  });

  useEffect(() => {
    if (query.data) {
      syncCart(query.data);
    }
  }, [query.data, syncCart]);

  useEffect(() => {
    if (!isOpen || isAuthenticated) {
      return;
    }

    syncCart(mapGuestCartToCart(loadGuestCart()));
  }, [isOpen, isAuthenticated, syncCart]);

  useEffect(() => {
    if (!isOpen || !cart?.items.length) {
      return;
    }

    let cancelled = false;

    validateCurrentCart()
      .then((result) => {
        if (cancelled) return;
        if (!result.valid) {
          setItemIssues(issuesFromValidationChanges(cart, result.changes));
        } else {
          setItemIssues({});
        }
      })
      .catch(() => {
        /* validation endpoint errors are non-fatal for cart display */
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, cart, setItemIssues, isAuthenticated]);

  return {
    ...query,
    isFetching: isAuthenticated ? query.isFetching : false,
  };
}
