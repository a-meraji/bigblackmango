import { apiClient } from '../client';
import type { ApiResponse } from '@t/api';
import type { AdminDailyMenu, AdminDailyMenuItem } from '@t/admin-catalog';

export interface DailyMenuPayload {
  menuDate: string;
  items: Array<{
    foodId: string;
    stock: number;
    isFeaturedInStory?: boolean;
    discountPercent?: number | null;
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
  payload: {
    stock?: number;
    isFeaturedInStory?: boolean;
    discountPercent?: number | null;
  },
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

export async function adminBulkUpdateMenuDiscount(payload: {
  menuItemIds: string[];
  discountPercent: number | null;
}): Promise<AdminDailyMenuItem[]> {
  const res = await apiClient.patch<ApiResponse<{ items: AdminDailyMenuItem[] }>>(
    '/admin/daily-menu/items/discount',
    payload,
  );
  return res.data.data.items;
}
