import {
  addCartItem,
  getCart,
  importCartItems,
  removeCartItem,
  updateCartItem,
  validateCart,
  validateCartItems,
  type CartValidateResult,
} from '@api/cart';
import { useAuthStore } from '@store/auth.store';
import type { Cart } from '@t/cart';

import { clearGuestCart, loadGuestCart, saveGuestCart } from './guest-cart.storage';
import { mapGuestCartToCart, mapGuestCartItemsForApi } from './guest-cart.mapper';
import type { GuestCartItemInput } from './guest-cart.types';

function isAuthenticated() {
  return useAuthStore.getState().isAuthenticated;
}

export async function hydrateCartFromSource(): Promise<Cart> {
  if (isAuthenticated()) {
    const cart = await getCart();
    return cart;
  }

  return mapGuestCartToCart(loadGuestCart());
}

export async function addItemToCart(input: GuestCartItemInput, quantity = 1): Promise<Cart> {
  if (isAuthenticated()) {
    return addCartItem({ menuItemId: input.menuItemId, quantity });
  }

  const storage = loadGuestCart();
  const existing = storage.items.find((item) => item.menuItemId === input.menuItemId);

  if (existing) {
    existing.quantity += quantity;
    existing.unitPrice = input.unitPrice;
    existing.originalUnitPrice = input.originalUnitPrice;
    existing.menuDiscountPercent = input.menuDiscountPercent;
    existing.food = input.food;
  } else {
    storage.items.push({
      menuItemId: input.menuItemId,
      quantity,
      unitPrice: input.unitPrice,
      originalUnitPrice: input.originalUnitPrice,
      menuDiscountPercent: input.menuDiscountPercent,
      food: input.food,
    });
  }

  saveGuestCart(storage);
  return mapGuestCartToCart(storage);
}

export async function updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
  if (isAuthenticated()) {
    return updateCartItem(itemId, quantity);
  }

  const storage = loadGuestCart();
  const item = storage.items.find((entry) => entry.menuItemId === itemId);

  if (!item) {
    return mapGuestCartToCart(storage);
  }

  if (quantity <= 0) {
    storage.items = storage.items.filter((entry) => entry.menuItemId !== itemId);
  } else {
    item.quantity = quantity;
  }

  saveGuestCart(storage);
  return mapGuestCartToCart(storage);
}

export async function removeItemFromCart(itemId: string): Promise<Cart> {
  if (isAuthenticated()) {
    return removeCartItem(itemId);
  }

  const storage = loadGuestCart();
  storage.items = storage.items.filter((entry) => entry.menuItemId !== itemId);
  saveGuestCart(storage);
  return mapGuestCartToCart(storage);
}

export async function validateCurrentCart(): Promise<CartValidateResult> {
  if (isAuthenticated()) {
    return validateCart();
  }

  const storage = loadGuestCart();

  if (storage.items.length === 0) {
    return { valid: true, changes: [] };
  }

  return validateCartItems(mapGuestCartItemsForApi(storage));
}

export async function mergeLocalCartAfterAuth(): Promise<Cart> {
  const storage = loadGuestCart();

  if (storage.items.length === 0) {
    clearGuestCart();
    return getCart();
  }

  try {
    const cart = await importCartItems(mapGuestCartItemsForApi(storage));
    clearGuestCart();
    return cart;
  } catch {
    return getCart();
  }
}

export function clearGuestCartStorage() {
  clearGuestCart();
}
