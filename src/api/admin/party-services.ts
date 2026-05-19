import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { AdminPartyServicePage } from '@types/admin-content';
import { normalizeFaq, normalizeServiceItems } from '@utils/normalize-party-service';

export interface PartyServicePayload {
  title: string;
  heroImageUrl?: string;
  gallery?: string[];
  summary?: string;
  description?: string;
  serviceItems?: string[];
  faq?: Array<{ question: string; answer: string }>;
  contactPhone?: string;
  isActive: boolean;
}

type RawAdminPartyService = {
  id: string;
  title: string;
  heroImageUrl: string | null;
  gallery: unknown;
  summary: string | null;
  description: string | null;
  serviceItems: unknown;
  faq: unknown;
  contactPhone: string | null;
  isActive: boolean;
};

export function mapAdminPartyServicePage(raw: RawAdminPartyService): AdminPartyServicePage {
  return {
    id: raw.id,
    title: raw.title,
    heroImageUrl: raw.heroImageUrl,
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery.filter((u): u is string => typeof u === 'string')
      : [],
    summary: raw.summary,
    description: raw.description,
    serviceItems: normalizeServiceItems(raw.serviceItems).map((s) => s.title),
    faq: normalizeFaq(raw.faq),
    contactPhone: raw.contactPhone,
    isActive: raw.isActive,
  };
}

export async function adminGetPartyServices(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ items: AdminPartyServicePage[]; meta: PaginationMeta }> {
  const res = await apiClient.get<
    ApiResponse<{ items: RawAdminPartyService[]; meta: PaginationMeta }>
  >('/admin/party-services', { params });
  return {
    items: res.data.data.items.map(mapAdminPartyServicePage),
    meta: (res.data.meta ?? { page: 1, limit: 20, total: 0 }) as PaginationMeta,
  };
}

export async function adminListPartyServices(): Promise<AdminPartyServicePage[]> {
  const { items } = await adminGetPartyServices({ limit: 100 });
  return items;
}

export async function adminCreatePartyService(
  payload: PartyServicePayload,
): Promise<AdminPartyServicePage> {
  const res = await apiClient.post<ApiResponse<{ service: RawAdminPartyService }>>(
    '/admin/party-services',
    payload,
  );
  return mapAdminPartyServicePage(res.data.data.service);
}

export async function adminUpdatePartyService(
  serviceId: string,
  payload: Partial<PartyServicePayload>,
): Promise<AdminPartyServicePage> {
  const res = await apiClient.patch<ApiResponse<{ service: RawAdminPartyService }>>(
    `/admin/party-services/${serviceId}`,
    payload,
  );
  return mapAdminPartyServicePage(res.data.data.service);
}

export async function adminDeletePartyService(serviceId: string): Promise<void> {
  await apiClient.delete(`/admin/party-services/${serviceId}`);
}
