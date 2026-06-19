import { apiClient } from './client';

export interface ReviewSubmitItem {
  foodId: string;
  rating: number;
  comment?: string;
}

/** Backend accepts one food per POST /reviews — batch on the client. */
export async function submitReviews(orderId: string, items: ReviewSubmitItem[]): Promise<void> {
  for (const item of items) {
    await apiClient.post('/reviews', {
      orderId,
      foodId: item.foodId,
      rating: item.rating,
      ...(item.comment?.trim() ? { comment: item.comment.trim() } : {}),
    });
  }
}
