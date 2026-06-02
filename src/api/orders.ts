import { apiClient } from './client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { Order, OrderDetail } from '@t/order';
import {
  filterOrdersByTab,
  mapOrderDetail,
  mapOrderSummary,
  type BackendOrderDetail,
  type BackendOrderSummary,
} from '@utils/map-order';

const DISMISSED_PROMPTS_KEY = 'dismissedReviewPrompts';

export async function getOrders(params?: {
  tab?: 'current' | 'past';
  page?: number;
  limit?: number;
}): Promise<{ items: Order[]; meta: PaginationMeta }> {
  const res = await apiClient.get<
    ApiResponse<{ items: BackendOrderSummary[] }> & { meta?: PaginationMeta }
  >('/orders', {
    params: { page: params?.page, limit: params?.limit },
  });

  const raw = res.data.data.items.map(mapOrderSummary);
  const items = params?.tab ? filterOrdersByTab(raw, params.tab) : raw;
  const meta = (res.data.meta as PaginationMeta | undefined) ?? {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    total: items.length,
  };

  return {
    items,
    meta: params?.tab ? { ...meta, total: items.length } : meta,
  };
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  const res = await apiClient.get<ApiResponse<{ order: BackendOrderDetail }>>(
    `/orders/${orderId}`,
  );
  return mapOrderDetail(res.data.data.order);
}

export interface OrderReceipt {
  trackingCode: string;
  items: Array<{
    id: string;
    foodId: string;
    foodName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  total: number;
  address: string;
  pricing: { subtotal: number; deliveryFee: number; total: number };
}

export async function getOrderReceipt(orderId: string): Promise<OrderReceipt> {
  const res = await apiClient.get<
    ApiResponse<{
      receipt: {
        trackingCode: string;
        items: OrderReceipt['items'];
        pricing: OrderReceipt['pricing'];
        address: unknown;
      };
    }>
  >(`/orders/${orderId}/receipt`);

  const receipt = res.data.data.receipt;
  const address =
    receipt.address && typeof receipt.address === 'object'
      ? String((receipt.address as { addressLine?: string }).addressLine ?? '—')
      : '—';

  return {
    trackingCode: receipt.trackingCode,
    items: receipt.items,
    total: receipt.pricing.total,
    address,
    pricing: receipt.pricing,
  };
}

export interface ReviewPrompt {
  orderId: string;
  trackingCode: string;
  promptShown: boolean;
  foods: Array<{ foodId: string; name: string }>;
}

export async function getReviewPrompts(): Promise<ReviewPrompt[]> {
  const dismissed = getDismissedPromptIds();
  const { items } = await getOrders({ tab: 'past', limit: 30 });
  const delivered = items.filter((o) => o.status === 'delivered' && !dismissed.includes(o.id));

  const prompts: ReviewPrompt[] = [];

  for (const order of delivered) {
    try {
      const detail = await getOrderDetail(order.id);
      if (detail.reviewPrompt.canReview && !detail.reviewPrompt.promptShown) {
        prompts.push({
          orderId: order.id,
          trackingCode: order.trackingCode,
          promptShown: false,
          foods: detail.items.map((item) => ({
            foodId: item.foodId,
            name: item.foodName,
          })),
        });
      }
    } catch {
      /* skip orders that fail to load */
    }
  }

  return prompts;
}

export async function dismissReviewPrompt(orderId: string): Promise<void> {
  try {
    await apiClient.post(`/orders/${orderId}/review-prompts/dismiss`);
  } catch {
    markPromptDismissed(orderId);
  }
}

function getDismissedPromptIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_PROMPTS_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function markPromptDismissed(orderId: string): void {
  const dismissed = getDismissedPromptIds();
  if (!dismissed.includes(orderId)) {
    sessionStorage.setItem(DISMISSED_PROMPTS_KEY, JSON.stringify([...dismissed, orderId]));
  }
}
