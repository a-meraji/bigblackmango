import { apiClient } from './client';
import type { ApiResponse } from '@types/api';

export interface ReviewItem {
  foodId: string;
  rating: number;
  comment?: string;
}

export async function submitReviews(
  orderId: string,
  items: ReviewItem[],
): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(`/orders/${orderId}/reviews`, { items });
}
