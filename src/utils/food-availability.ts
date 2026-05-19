import type { FoodTodayAvailability } from '@types/food';

export type NormalizedAvailability = {
  menuItemId: string;
  stock: number;
  isAvailable: boolean;
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
  };
}
