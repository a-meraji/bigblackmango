import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminServiceItem } from '@t/admin-content';

export interface ServiceItemPayload {
  servicePageId: string;
  title: string;
  description?: string;
  gallery?: string[];
  features?: string[];
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

type RawServiceItem = {
  id: string;
  servicePageId: string;
  title: string;
  description: string | null;
  gallery: unknown;
  features: unknown;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

function toStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string');
}

function mapServiceItem(raw: RawServiceItem): AdminServiceItem {
  return {
    id: raw.id,
    servicePageId: raw.servicePageId,
    title: raw.title,
    description: raw.description,
    gallery: toStringArray(raw.gallery),
    features: toStringArray(raw.features),
    icon: raw.icon,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

export async function adminListServiceItems(
  servicePageId: string,
): Promise<AdminServiceItem[]> {
  const res = await apiClient.get<
    ApiResponse<{ items: RawServiceItem[]; meta: PaginationMeta }>
  >('/admin/service-items', {
    params: { servicePageId, limit: 100 },
  });
  return res.data.data.items.map(mapServiceItem);
}

export async function adminCreateServiceItem(
  payload: ServiceItemPayload,
): Promise<AdminServiceItem> {
  const res = await apiClient.post<ApiResponse<{ item: RawServiceItem }>>(
    '/admin/service-items',
    payload,
  );
  return mapServiceItem(res.data.data.item);
}

export async function adminUpdateServiceItem(
  id: string,
  payload: Partial<Omit<ServiceItemPayload, 'servicePageId'>>,
): Promise<AdminServiceItem> {
  const res = await apiClient.patch<ApiResponse<{ item: RawServiceItem }>>(
    `/admin/service-items/${id}`,
    payload,
  );
  return mapServiceItem(res.data.data.item);
}

export async function adminDeleteServiceItem(id: string): Promise<void> {
  await apiClient.delete(`/admin/service-items/${id}`);
}
