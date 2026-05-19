import { apiClient } from '../client';
import type { ApiResponse } from '@types/api';
import type { AdminCategory } from '@types/admin-catalog';

export interface CategoryPayload {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function adminGetCategories(params?: {
  search?: string;
  isActive?: boolean;
}): Promise<AdminCategory[]> {
  const res = await apiClient.get<ApiResponse<AdminCategory[]>>('/admin/categories', {
    params,
  });
  return res.data.data;
}

export async function adminCreateCategory(payload: CategoryPayload): Promise<AdminCategory> {
  const res = await apiClient.post<ApiResponse<AdminCategory>>('/admin/categories', payload);
  return res.data.data;
}

export async function adminUpdateCategory(
  categoryId: string,
  payload: Partial<CategoryPayload>,
): Promise<AdminCategory> {
  const res = await apiClient.patch<ApiResponse<AdminCategory>>(
    `/admin/categories/${categoryId}`,
    payload,
  );
  return res.data.data;
}

export async function adminDeleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${categoryId}`);
}
