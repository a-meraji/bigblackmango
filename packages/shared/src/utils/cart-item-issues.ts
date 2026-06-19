import type { Cart } from '@t/cart';

export type CartItemIssue =
  | { type: 'unavailable' }
  | { type: 'limited'; maxQuantity: number };

export type CartValidationChange = {
  menuItemId: string;
  requestedQuantity: number;
  availableQuantity: number;
};

export function issuesFromValidationChanges(
  cart: Cart,
  changes: CartValidationChange[],
): Record<string, CartItemIssue> {
  const issues: Record<string, CartItemIssue> = {};

  for (const change of changes) {
    const cartItem = cart.items.find((i) => i.menuItemId === change.menuItemId);
    if (!cartItem) continue;

    if (change.availableQuantity <= 0) {
      issues[cartItem.id] = { type: 'unavailable' };
    } else if (change.availableQuantity < change.requestedQuantity) {
      issues[cartItem.id] = { type: 'limited', maxQuantity: change.availableQuantity };
    }
  }

  return issues;
}

export function issueFromCartError(
  menuItemId: string,
  code: string,
  details?: CartValidationChange[],
): CartItemIssue | null {
  if (code === 'INACTIVE_RESOURCE') {
    return { type: 'unavailable' };
  }

  if (code === 'OUT_OF_STOCK' && details?.length) {
    const change = details.find((d) => d.menuItemId === menuItemId);
    if (!change) return null;
    if (change.availableQuantity <= 0) return { type: 'unavailable' };
    return { type: 'limited', maxQuantity: change.availableQuantity };
  }

  return null;
}

export function pruneItemIssues(
  issues: Record<string, CartItemIssue>,
  cart: Cart,
): Record<string, CartItemIssue> {
  const ids = new Set(cart.items.map((i) => i.id));
  const next: Record<string, CartItemIssue> = {};
  for (const [id, issue] of Object.entries(issues)) {
    if (ids.has(id)) next[id] = issue;
  }
  return next;
}
