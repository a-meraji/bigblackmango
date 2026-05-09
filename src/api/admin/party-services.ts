import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { PartyServicePage } from '@types/party-service';

export interface PartyServicePayload {
  title: string;
  heroImageUrl: string;
  gallery: string[];
  summary: string;
  description: string;
  serviceItems: string[];
  faq: Array<{ question: string; answer: string }>;
  contactPhone: string;
  isActive: boolean;
}

export async function adminGetPartyServices(params?: {
  page?: number;
  limit?: number;
}): Promise<{ items: PartyServicePage[]; meta: PaginationMeta }> {
  const res = await apiClient.get<
    ApiResponse<{ items: PartyServicePage[]; meta: PaginationMeta }>
  >('/admin/party-services', { params });
  return res.data.data;
}

export async function adminCreatePartyService(
  payload: PartyServicePayload,
): Promise<PartyServicePage> {
  const res = await apiClient.post<ApiResponse<{ service: PartyServicePage }>>(
    '/admin/party-services',
    payload,
  );
  return res.data.data.service;
}

export async function adminUpdatePartyService(
  serviceId: string,
  payload: Partial<PartyServicePayload>,
): Promise<PartyServicePage> {
  const res = await apiClient.patch<ApiResponse<{ service: PartyServicePage }>>(
    `/admin/party-services/${serviceId}`,
    payload,
  );
  return res.data.data.service;
}

export async function adminDeletePartyService(serviceId: string): Promise<void> {
  await apiClient.delete(`/admin/party-services/${serviceId}`);
}
