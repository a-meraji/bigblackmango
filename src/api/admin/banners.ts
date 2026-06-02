import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminBanner } from '@t/admin-content';

export interface BannerPayload {
  title: string;
  subtitle?: string;
  imageUrl: string;
  sortOrder?: number;
  servicePageId: string;
  isActive: boolean;
}

export async function adminGetBanners(params?: {
  page?: number;
  limit?: number;
}): Promise<{ items: AdminBanner[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: AdminBanner[]; meta: PaginationMeta }>>(
    '/admin/party-service-banners',
    { params },
  );
  return res.data.data;
}

export async function adminListBanners(): Promise<AdminBanner[]> {
  const { items } = await adminGetBanners({ limit: 100 });
  return items;
}

export async function adminCreateBanner(payload: BannerPayload): Promise<AdminBanner> {
  const res = await apiClient.post<ApiResponse<{ banner: AdminBanner }>>(
    '/admin/party-service-banners',
    payload,
  );
  return res.data.data.banner;
}

export async function adminUpdateBanner(
  bannerId: string,
  payload: Partial<BannerPayload>,
): Promise<AdminBanner> {
  const res = await apiClient.patch<ApiResponse<{ banner: AdminBanner }>>(
    `/admin/party-service-banners/${bannerId}`,
    payload,
  );
  return res.data.data.banner;
}

export async function adminDeleteBanner(bannerId: string): Promise<void> {
  await apiClient.delete(`/admin/party-service-banners/${bannerId}`);
}
