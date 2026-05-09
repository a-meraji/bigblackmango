import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { Category } from '@types/food';

export interface CategoryPayload {
  name: string;
  displayOrder?: number;
  imageUrl?: string;
}

export async function adminGetCategories(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: Category[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: Category[]; meta: PaginationMeta }>>(
    '/admin/categories',
    { params },
  );
  return res.data.data;
}

export async function adminCreateCategory(payload: CategoryPayload): Promise<Category> {
  const res = await apiClient.post<ApiResponse<{ category: Category }>>(
    '/admin/categories',
    payload,
  );
  return res.data.data.category;
}

export async function adminUpdateCategory(
  categoryId: string,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  const res = await apiClient.patch<ApiResponse<{ category: Category }>>(
    `/admin/categories/${categoryId}`,
    payload,
  );
  return res.data.data.category;
}

export async function adminDeleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${categoryId}`);
}
