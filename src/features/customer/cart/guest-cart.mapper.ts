import type { Cart, CartItem } from '@types/cart';

import type { GuestCartStorage } from './guest-cart.types';

const CURRENCY = 'IRT';

export function getDeliveryFee(subtotal: number) {
  if (subtotal <= 0) {
    return 0;
  }

  const configured = Number(import.meta.env.VITE_DELIVERY_FEE ?? 25000);

  return Number.isFinite(configured) && configured >= 0 ? configured : 25000;
}

function calculateLineTotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity;
}

export function mapGuestCartToCart(storage: GuestCartStorage): Cart {
  const items: CartItem[] = storage.items.map((item) => ({
    id: item.menuItemId,
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: calculateLineTotal(item.unitPrice, item.quantity),
    food: {
      id: item.food.id,
      name: item.food.name,
      thumbnailUrl: item.food.thumbnailUrl,
    },
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = getDeliveryFee(subtotal);

  return {
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    currency: CURRENCY,
  };
}

export function mapGuestCartItemsForApi(storage: GuestCartStorage) {
  return storage.items.map((item) => ({
    menuItemId: item.menuItemId,
    quantity: item.quantity,
  }));
}
