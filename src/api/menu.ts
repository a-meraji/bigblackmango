import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { Category, DailyMenuItem } from '@types/food';

export interface MenuTodayPayload {
  menuDate: string;
  expiresAt: string | null;
  items: DailyMenuItem[];
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return res.data.data;
}

export async function getMenuToday(params?: {
  categoryId?: string;
  search?: string;
}): Promise<MenuTodayPayload> {
  const res = await apiClient.get<ApiResponse<MenuTodayPayload>>('/menu/today', { params });
  return res.data.data;
}
