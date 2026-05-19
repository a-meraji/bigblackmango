import { apiClient } from '../client';
import type { ApiResponse } from '@types/api';
import type { AdminDailyMenu, AdminDailyMenuItem } from '@types/admin-catalog';

export interface DailyMenuPayload {
  menuDate: string;
  items: Array<{
    foodId: string;
    stock: number;
    isFeaturedInStory?: boolean;
  }>;
}

export async function adminGetDailyMenu(date: string): Promise<AdminDailyMenu> {
  const res = await apiClient.get<ApiResponse<AdminDailyMenu>>('/admin/daily-menu', {
    params: { date },
  });
  return res.data.data;
}

export async function adminSetDailyMenu(payload: DailyMenuPayload): Promise<AdminDailyMenu> {
  const res = await apiClient.put<ApiResponse<AdminDailyMenu>>('/admin/daily-menu', payload);
  return res.data.data;
}

export async function adminUpdateMenuItemStock(
  menuItemId: string,
  payload: { stock?: number; isFeaturedInStory?: boolean },
): Promise<AdminDailyMenuItem> {
  const res = await apiClient.patch<ApiResponse<{ item: AdminDailyMenuItem }>>(
    `/admin/daily-menu/items/${menuItemId}`,
    payload,
  );
  return res.data.data.item;
}

export async function adminRemoveMenuItem(menuItemId: string): Promise<void> {
  await apiClient.delete(`/admin/daily-menu/items/${menuItemId}`);
}
