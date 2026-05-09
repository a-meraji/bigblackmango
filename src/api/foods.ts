import { apiClient } from './client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { Food } from '@types/food';
import type { Review } from '@types/review';

export interface FoodTodayAvailability {
  menuItemId: string;
  stock: number;
  isAvailable: boolean;
}

export interface FoodDetailPayload {
  food: Food;
  todayAvailability: FoodTodayAvailability | null;
  reviews: {
    items: Review[];
    summary: { average: number; count: number };
  };
  relatedFoods: Food[];
}

export async function getFoodDetail(foodId: string): Promise<FoodDetailPayload> {
  const res = await apiClient.get<ApiResponse<FoodDetailPayload>>(`/foods/${foodId}`);
  return res.data.data;
}

export async function getFoodReviews(
  foodId: string,
  params?: { page?: number; limit?: number },
): Promise<{ items: Review[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: Review[]; meta: PaginationMeta }>>(
    `/foods/${foodId}/reviews`,
    { params },
  );
  return res.data.data;
}
