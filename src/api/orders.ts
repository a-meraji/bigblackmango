import { apiClient } from './client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { Order } from '@types/order';

export async function getOrders(params?: {
  tab?: 'current' | 'past';
  page?: number;
  limit?: number;
}): Promise<{ items: Order[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: Order[]; meta: PaginationMeta }>>(
    '/orders',
    { params },
  );
  return res.data.data;
}

export async function getOrderDetail(orderId: string): Promise<Order> {
  const res = await apiClient.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`);
  return res.data.data.order;
}

export async function getOrderReceipt(orderId: string): Promise<unknown> {
  const res = await apiClient.get<ApiResponse<unknown>>(`/orders/${orderId}/receipt`);
  return res.data.data;
}

export interface ReviewPrompt {
  orderId: string;
  trackingCode: string;
  promptShown: boolean;
  foods: Array<{ foodId: string; name: string }>;
}

export async function getReviewPrompts(): Promise<ReviewPrompt[]> {
  const res = await apiClient.get<ApiResponse<{ items: ReviewPrompt[] }>>(
    '/orders/review-prompts',
  );
  return res.data.data.items;
}

export async function dismissReviewPrompt(orderId: string): Promise<void> {
  await apiClient.post(`/orders/${orderId}/review-prompts/dismiss`);
}
