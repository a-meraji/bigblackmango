import type { FoodTodayAvailability } from '@t/food';

export type NormalizedAvailability = {
  menuItemId: string;
  stock: number;
  isAvailable: boolean;
  discountPercent: number | null;
  salePrice: number;
};

/** Backend always returns an object; treat missing menuItemId as unavailable. */
export function normalizeTodayAvailability(
  availability: FoodTodayAvailability,
): NormalizedAvailability | null {
  if (!availability.menuItemId) return null;
  return {
    menuItemId: availability.menuItemId,
    stock: availability.stock,
    isAvailable: availability.isAvailable,
    discountPercent: availability.discountPercent ?? null,
    salePrice: availability.salePrice ?? 0,
  };
}
