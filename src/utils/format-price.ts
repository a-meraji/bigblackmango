/**
 * Format a Toman amount to a localized Persian string.
 * Always use this instead of inline toLocaleString for prices.
 */
export function formatPrice(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' تومان';
}
