import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminFood } from '@t/admin-catalog';

export interface FoodPayload {
  categoryId: string;
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  isActive: boolean;
}

export interface FoodFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function adminGetFoods(
  filters?: FoodFilters,
): Promise<{ items: AdminFood[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: AdminFood[] }>>('/admin/foods', {
    params: filters,
  });
  return {
    items: res.data.data.items,
    meta: (res.data.meta ?? { page: 1, limit: 20, total: 0 }) as PaginationMeta,
  };
}

export async function adminCreateFood(payload: FoodPayload): Promise<AdminFood> {
  const res = await apiClient.post<ApiResponse<{ food: AdminFood }>>('/admin/foods', payload);
  return res.data.data.food;
}

export async function adminUpdateFood(
  foodId: string,
  payload: Partial<FoodPayload>,
): Promise<AdminFood> {
  const res = await apiClient.patch<ApiResponse<{ food: AdminFood }>>(
    `/admin/foods/${foodId}`,
    payload,
  );
  return res.data.data.food;
}

export async function adminDeleteFood(foodId: string): Promise<void> {
  await apiClient.delete(`/admin/foods/${foodId}`);
}
