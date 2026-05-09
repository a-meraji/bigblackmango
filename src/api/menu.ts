import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { Category, DailyMenuItem } from '@types/food';

export interface MenuTodayPayload {
  menuDate: string;
  expiresAt: string;
  items: DailyMenuItem[];
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<{ categories: Category[] }>>('/categories');
  return res.data.data.categories;
}

export async function getMenuToday(params?: {
  categoryId?: string;
  search?: string;
}): Promise<MenuTodayPayload> {
  const res = await apiClient.get<ApiResponse<MenuTodayPayload>>('/menu/today', { params });
  return res.data.data;
}
