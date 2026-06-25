import type { Order, OrderStatus, ReviewPromptInfo, ReviewStatus } from '@t/order';
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
  reviewPrompt?: BackendReviewPrompt;
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
  reviewPrompt: BackendReviewPrompt;
}

export interface BackendReviewPrompt {
  canReview: boolean;
  shouldPrompt: boolean;
  promptShown: boolean;
  dismissedAt: string | null;
  expiresAt: string;
  hasSubmittedReview: boolean;
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

function mapReviewPrompt(raw?: BackendReviewPrompt): ReviewPromptInfo | undefined {
  if (!raw) return undefined;

  return {
    canReview: raw.canReview,
    shouldPrompt: raw.shouldPrompt,
    promptShown: raw.promptShown,
    dismissedAt: raw.dismissedAt,
    expiresAt: raw.expiresAt,
    hasSubmittedReview: raw.hasSubmittedReview,
  };
}

function deriveReviewStatus(
  status: OrderStatus,
  reviewPrompt?: ReviewPromptInfo,
): ReviewStatus {
  if (status !== 'delivered') return 'not_applicable';
  if (!reviewPrompt) return 'not_applicable';
  if (reviewPrompt.hasSubmittedReview) return 'submitted';
  if (!reviewPrompt.canReview) {
    return reviewPrompt.hasSubmittedReview ? 'submitted' : 'expired';
  }
  return 'pending';
}

export function mapOrderSummary(raw: BackendOrderSummary): Order {
  const preview = raw.itemsPreview ?? [];
  const previewLine = preview.map((i) => `${i.foodName} × ${i.quantity}`).join(' · ');
  const reviewPrompt = mapReviewPrompt(raw.reviewPrompt);

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
    reviewStatus: deriveReviewStatus(raw.status, reviewPrompt),
    reviewPrompt,
    itemsPreview: preview,
  };
}

export function mapOrderDetail(raw: BackendOrderDetail): Order & {
  items: BackendOrderDetail['items'];
  reviewPrompt: ReviewPromptInfo;
} {
  const reviewPrompt = mapReviewPrompt(raw.reviewPrompt) ?? {
    canReview: false,
    shouldPrompt: false,
    promptShown: true,
    dismissedAt: null,
    expiresAt: new Date().toISOString(),
    hasSubmittedReview: false,
  };

  const base = mapOrderSummary(raw);

  return {
    ...base,
    address: { addressLine: parseAddressLine(raw.address) },
    reviewStatus: deriveReviewStatus(raw.status, reviewPrompt),
    items: raw.items,
    reviewPrompt,
  };
}

export function filterOrdersByTab(orders: Order[], tab: 'current' | 'past'): Order[] {
  if (tab === 'past') return orders.filter((o) => isPastOrder(o.status));
  return orders.filter((o) => !isPastOrder(o.status));
}
