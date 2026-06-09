import { getMenuToday } from '@api/menu';
import type { Cart } from '@t/cart';

import { mapGuestCartToCart } from './guest-cart.mapper';
import { loadGuestCart, saveGuestCart } from './guest-cart.storage';

export async function reconcileGuestCartPrices(): Promise<Cart> {
  const storage = loadGuestCart();

  if (storage.items.length === 0) {
    return mapGuestCartToCart(storage);
  }

  try {
    const menu = await getMenuToday();
    const menuById = new Map(menu.items.map((item) => [item.menuItemId, item]));
    let changed = false;

    for (const item of storage.items) {
      const menuItem = menuById.get(item.menuItemId);
      if (!menuItem) continue;

      const salePrice = menuItem.salePrice ?? menuItem.food.price;
      const hasDiscount =
        menuItem.discountPercent != null &&
        menuItem.discountPercent > 0 &&
        salePrice < menuItem.food.price;

      if (item.unitPrice !== salePrice) {
        item.unitPrice = salePrice;
        changed = true;
      }

      const nextOriginal = hasDiscount ? menuItem.food.price : undefined;
      const nextPercent = hasDiscount ? menuItem.discountPercent : undefined;

      if (item.originalUnitPrice !== nextOriginal) {
        item.originalUnitPrice = nextOriginal;
        changed = true;
      }

      if (item.menuDiscountPercent !== nextPercent) {
        item.menuDiscountPercent = nextPercent;
        changed = true;
      }
    }

    if (changed) {
      saveGuestCart(storage);
    }
  } catch {
    /* keep stored cart if menu fetch fails */
  }

  return mapGuestCartToCart(storage);
}
