import { apiClient } from './client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type {
  FoodRating,
  FoodTodayAvailability,
  PublicFoodDetail,
  PublicFoodSummary,
} from '@types/food';
import type { PublicReview } from '@types/review';

export interface FoodDetailPayload {
  food: PublicFoodDetail;
  todayAvailability: FoodTodayAvailability;
  reviews: {
    items: PublicReview[];
    summary: FoodRating;
  };
  relatedFoods: PublicFoodSummary[];
}

export async function getFoodDetail(foodId: string): Promise<FoodDetailPayload> {
  const res = await apiClient.get<ApiResponse<FoodDetailPayload>>(`/foods/${foodId}`);
  return res.data.data;
}

export async function getFoodReviews(
  foodId: string,
  params?: { page?: number; limit?: number },
): Promise<{ items: PublicReview[]; summary: FoodRating; meta: PaginationMeta }> {
  const res = await apiClient.get<
    ApiResponse<{ items: PublicReview[]; summary: FoodRating }>
  >(`/foods/${foodId}/reviews`, { params });
  return {
    items: res.data.data.items,
    summary: res.data.data.summary,
    meta: (res.data.meta ?? { page: 1, limit: 10, total: 0 }) as PaginationMeta,
  };
}
