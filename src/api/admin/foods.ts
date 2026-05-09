import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { Food } from '@types/food';

export interface FoodPayload {
  name: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  basePrice: number;
  tags: string[];
  preparationTime?: number;
  isActive: boolean;
}

export async function adminGetFoods(params?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ items: Food[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: Food[]; meta: PaginationMeta }>>(
    '/admin/foods',
    { params },
  );
  return res.data.data;
}

export async function adminCreateFood(payload: FoodPayload): Promise<Food> {
  const res = await apiClient.post<ApiResponse<{ food: Food }>>('/admin/foods', payload);
  return res.data.data.food;
}

export async function adminUpdateFood(
  foodId: string,
  payload: Partial<FoodPayload>,
): Promise<Food> {
  const res = await apiClient.patch<ApiResponse<{ food: Food }>>(
    `/admin/foods/${foodId}`,
    payload,
  );
  return res.data.data.food;
}

export async function adminDeleteFood(foodId: string): Promise<void> {
  await apiClient.delete(`/admin/foods/${foodId}`);
}
