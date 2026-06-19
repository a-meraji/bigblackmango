import type { GuestCartStorage, GuestCartStoredItem } from './guest-cart.types';

const GUEST_CART_STORAGE_KEY = 'bbm_guest_cart_v1';

export function loadGuestCart(): GuestCartStorage {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);

    if (!raw) {
      return { items: [] };
    }

    const parsed = JSON.parse(raw) as GuestCartStorage;

    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items.filter(isValidStoredItem),
    };
  } catch {
    return { items: [] };
  }
}

export function saveGuestCart(cart: GuestCartStorage) {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}

export function getGuestCartItemCount(cart: GuestCartStorage = loadGuestCart()) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function isValidStoredItem(item: unknown): item is GuestCartStoredItem {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const record = item as GuestCartStoredItem;

  return (
    typeof record.menuItemId === 'string' &&
    Number.isInteger(record.quantity) &&
    record.quantity > 0 &&
    Number.isInteger(record.unitPrice) &&
    record.unitPrice >= 0 &&
    typeof record.food?.id === 'string' &&
    typeof record.food?.name === 'string'
  );
}
