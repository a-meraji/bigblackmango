import { apiClient } from '../client';
import type { ApiResponse } from '@types/api';
import type { Food } from '@types/food';

export interface AdminDailyMenuItem {
  menuItemId: string;
  stock: number;
  isFeaturedInStory: boolean;
  food: Pick<Food, 'id' | 'name' | 'thumbnailUrl' | 'basePrice'>;
}

export interface DailyMenuPayload {
  menuDate: string;
  items: Array<{
    foodId: string;
    stock: number;
    isFeaturedInStory?: boolean;
  }>;
}

export async function adminGetDailyMenu(params?: {
  date?: string;
}): Promise<{ menuDate: string; items: AdminDailyMenuItem[] }> {
  const res = await apiClient.get<ApiResponse<{ menuDate: string; items: AdminDailyMenuItem[] }>>(
    '/admin/daily-menu',
    { params },
  );
  return res.data.data;
}

export async function adminSetDailyMenu(
  payload: DailyMenuPayload,
): Promise<AdminDailyMenuItem[]> {
  const res = await apiClient.put<ApiResponse<{ items: AdminDailyMenuItem[] }>>(
    '/admin/daily-menu',
    payload,
  );
  return res.data.data.items;
}

export async function adminUpdateMenuItemStock(
  menuItemId: string,
  payload: { stock?: number; isFeaturedInStory?: boolean },
): Promise<AdminDailyMenuItem> {
  const res = await apiClient.patch<ApiResponse<AdminDailyMenuItem>>(
    `/admin/daily-menu/items/${menuItemId}`,
    payload,
  );
  return res.data.data;
}

export async function adminRemoveMenuItem(menuItemId: string): Promise<void> {
  await apiClient.delete(`/admin/daily-menu/items/${menuItemId}`);
}
