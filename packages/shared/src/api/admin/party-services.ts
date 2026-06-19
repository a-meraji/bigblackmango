import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminPartyServicePage } from '@t/admin-content';
import type { FaqItem, ServiceStat } from '@t/party-service';
import { normalizeFaq } from '@utils/normalize-party-service';

export interface PartyServicePayload {
  title: string;
  heroImageUrl?: string;
  gallery?: string[];
  summary?: string;
  description?: string;
  stats?: ServiceStat[];
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
  stats: unknown;
  faq: unknown;
  contactPhone: string | null;
  isActive: boolean;
};

function toStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string');
}

function normalizeStats(raw: unknown): ServiceStat[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map((s) => ({
      label: String(s.label ?? ''),
      value: String(s.value ?? ''),
      icon: typeof s.icon === 'string' ? s.icon : null,
    }));
}

export function mapAdminPartyServicePage(raw: RawAdminPartyService): AdminPartyServicePage {
  return {
    id: raw.id,
    title: raw.title,
    heroImageUrl: raw.heroImageUrl,
    gallery: toStringArray(raw.gallery),
    summary: raw.summary,
    description: raw.description,
    stats: normalizeStats(raw.stats),
    faq: normalizeFaq(raw.faq) as FaqItem[],
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
