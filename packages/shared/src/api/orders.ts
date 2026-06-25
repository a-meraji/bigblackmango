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
    originalUnitPrice?: number | null;
    menuDiscountPercent?: number | null;
    lineTotal: number;
  }>;
  total: number;
  address: string;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discountAmount?: number;
    discountCode?: string | null;
    total: number;
  };
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
  expiresAt: string;
  foods: Array<{ foodId: string; name: string }>;
}

export async function getPendingReviewPrompts(): Promise<ReviewPrompt[]> {
  const res = await apiClient.get<ApiResponse<{ prompts: ReviewPrompt[] }>>(
    '/orders/review-prompts/pending',
  );
  return res.data.data.prompts;
}

export async function getReviewPromptForOrder(orderId: string): Promise<ReviewPrompt | null> {
  const detail = await getOrderDetail(orderId);
  if (!detail.reviewPrompt.canReview) {
    return null;
  }

  return {
    orderId: detail.id,
    trackingCode: detail.trackingCode,
    promptShown: detail.reviewPrompt.promptShown,
    expiresAt: detail.reviewPrompt.expiresAt,
    foods: detail.items.map((item) => ({
      foodId: item.foodId,
      name: item.foodName,
    })),
  };
}

/** @deprecated Use getPendingReviewPrompts */
export async function getReviewPrompts(): Promise<ReviewPrompt[]> {
  return getPendingReviewPrompts();
}

export async function dismissReviewPrompt(orderId: string): Promise<void> {
  await apiClient.post(`/orders/${orderId}/review-prompts/dismiss`);
}
