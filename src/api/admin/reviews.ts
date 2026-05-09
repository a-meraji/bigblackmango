import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';

export interface AdminReview {
  id: string;
  foodId: string;
  foodName: string;
  authorName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  adminReply: { message: string; createdAt: string } | null;
}

export interface AdminReviewFilters {
  rating?: number;
  isVisible?: boolean;
  hasAdminReply?: boolean;
  foodId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function adminGetReviews(
  filters?: AdminReviewFilters,
): Promise<{ items: AdminReview[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: AdminReview[]; meta: PaginationMeta }>>(
    '/admin/reviews',
    { params: filters },
  );
  return res.data.data;
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
): Promise<AdminReview> {
  const res = await apiClient.put<ApiResponse<AdminReview>>(
    `/admin/reviews/${reviewId}/reply`,
    { message },
  );
  return res.data.data;
}

export async function adminDeleteReply(reviewId: string): Promise<void> {
  await apiClient.delete(`/admin/reviews/${reviewId}/reply`);
}
