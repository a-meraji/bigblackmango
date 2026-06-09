import type { Order, OrderStatus, ReviewStatus } from '@t/order';
import { statusLabel } from '@utils/order-status';

export interface BackendOrderSummary {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  paymentStatus?: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount?: number;
  discountCode?: string | null;
  total: number;
  orderedAt: string;
  itemsPreview?: Array<{ foodName: string; quantity: number }>;
}

export interface BackendOrderDetail extends BackendOrderSummary {
  address?: unknown;
  contact?: unknown;
  items: Array<{
    id: string;
    foodId: string;
    foodName: string;
    quantity: number;
    unitPrice: number;
    originalUnitPrice?: number | null;
    menuDiscountPercent?: number | null;
    lineTotal: number;
  }>;
  reviewPrompt?: { canReview: boolean; promptShown: boolean };
}

const PAST_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

export function isPastOrder(status: OrderStatus): boolean {
  return PAST_STATUSES.includes(status);
}

function parseAddressLine(address: unknown): string {
  if (!address || typeof address !== 'object') return '—';
  const a = address as { addressLine?: string };
  return a.addressLine?.trim() || '—';
}

export function mapOrderSummary(raw: BackendOrderSummary): Order {
  const preview = raw.itemsPreview ?? [];
  const previewLine = preview.map((i) => `${i.foodName} × ${i.quantity}`).join(' · ');

  return {
    id: raw.id,
    trackingCode: raw.trackingCode,
    status: raw.status,
    statusLabel: statusLabel(raw.status),
    orderedAt:
      typeof raw.orderedAt === 'string' ? raw.orderedAt : new Date(raw.orderedAt).toISOString(),
    lastStatusChangedAt:
      typeof raw.orderedAt === 'string' ? raw.orderedAt : new Date(raw.orderedAt).toISOString(),
    address: { addressLine: previewLine || '—' },
    pricing: {
      subtotal: raw.subtotal,
      deliveryFee: raw.deliveryFee,
      discountAmount: raw.discountAmount ?? 0,
      discountCode: raw.discountCode ?? null,
      total: raw.total,
    },
    reviewStatus: deriveReviewStatus(raw.status, false),
    itemsPreview: preview,
  };
}

export function mapOrderDetail(raw: BackendOrderDetail): Order & {
  items: BackendOrderDetail['items'];
  reviewPrompt: { canReview: boolean; promptShown: boolean };
} {
  const base = mapOrderSummary(raw);
  const rp = raw.reviewPrompt ?? { canReview: false, promptShown: true };

  return {
    ...base,
    address: { addressLine: parseAddressLine(raw.address) },
    reviewStatus: deriveReviewStatus(raw.status, rp.canReview && !rp.promptShown),
    items: raw.items,
    reviewPrompt: rp,
  };
}

function deriveReviewStatus(status: OrderStatus, canReview: boolean): ReviewStatus {
  if (status !== 'delivered') return 'not_applicable';
  return canReview ? 'pending' : 'submitted';
}

export function filterOrdersByTab(orders: Order[], tab: 'current' | 'past'): Order[] {
  if (tab === 'past') return orders.filter((o) => isPastOrder(o.status));
  return orders.filter((o) => !isPastOrder(o.status));
}
