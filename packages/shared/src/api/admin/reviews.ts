import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';

export interface AdminReview {
  id: string;
  foodId: string;
  foodName: string;
  userId: string;
  userMobile: string;
  orderId: string;
  orderTrackingCode: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  adminReply: { message: string; repliedAt: string } | null;
}

export interface AdminReviewFilters {
  foodId?: string;
  rating?: number;
  isVisible?: boolean;
  /** Applied on the current result set when the API has no server filter */
  hasAdminReply?: boolean;
  page?: number;
  limit?: number;
}

type RawAdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  user: { id: string; mobile: string };
  food: { id: string; name: string };
  order: { id: string; trackingCode: string };
  adminReply: { message: string; repliedAt: string } | null;
};

function mapReview(raw: RawAdminReview): AdminReview {
  return {
    id: raw.id,
    foodId: raw.food.id,
    foodName: raw.food.name,
    userId: raw.user.id,
    userMobile: raw.user.mobile,
    orderId: raw.order.id,
    orderTrackingCode: raw.order.trackingCode,
    rating: raw.rating,
    comment: raw.comment,
    isVisible: raw.isVisible,
    createdAt: raw.createdAt,
    adminReply: raw.adminReply,
  };
}

export async function adminGetReviews(
  filters?: AdminReviewFilters,
): Promise<{ items: AdminReview[]; meta: PaginationMeta }> {
  const { hasAdminReply, ...params } = filters ?? {};
  const res = await apiClient.get<ApiResponse<{ items: RawAdminReview[] }>>('/admin/reviews', {
    params,
  });
  let items = res.data.data.items.map(mapReview);
  if (hasAdminReply === true) {
    items = items.filter((r) => r.adminReply !== null);
  } else if (hasAdminReply === false) {
    items = items.filter((r) => r.adminReply === null);
  }
  return {
    items,
    meta: (res.data.meta ?? { page: 1, limit: 20, total: 0 }) as PaginationMeta,
  };
}

export async function adminSetReviewVisibility(
  reviewId: string,
  isVisible: boolean,
): Promise<{ id: string; isVisible: boolean }> {
  const res = await apiClient.patch<ApiResponse<{ review: { id: string; isVisible: boolean } }>>(
    `/admin/reviews/${reviewId}/visibility`,
    { isVisible },
  );
  return res.data.data.review;
}

export async function adminUpsertReply(
  reviewId: string,
  message: string,
): Promise<{ message: string; repliedAt: string }> {
  const res = await apiClient.post<ApiResponse<{ reply: { message: string; repliedAt: string } }>>(
    `/admin/reviews/${reviewId}/reply`,
    { message },
  );
  return res.data.data.reply;
}

export async function adminDeleteReply(reviewId: string): Promise<void> {
  await apiClient.delete(`/admin/reviews/${reviewId}/reply`);
}
