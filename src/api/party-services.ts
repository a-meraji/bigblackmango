import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { PartyServicePage, PartyServiceSummary } from '@types/party-service';
import { normalizeFaq, normalizeServiceItems } from '@utils/normalize-party-service';

function mapPartyServiceSummary(raw: PartyServiceSummary): PartyServiceSummary {
  return {
    ...raw,
    serviceItems: normalizeServiceItems(raw.serviceItems),
  };
}

function mapPartyServicePage(raw: PartyServicePage): PartyServicePage {
  return {
    ...mapPartyServiceSummary(raw),
    gallery: Array.isArray(raw.gallery) ? raw.gallery.filter((u) => typeof u === 'string') : [],
    faq: normalizeFaq(raw.faq),
  };
}

export async function getPartyServices(): Promise<PartyServiceSummary[]> {
  const res = await apiClient.get<ApiResponse<PartyServiceSummary[]>>('/party-services');
  return res.data.data.map(mapPartyServiceSummary);
}

export async function getPartyService(serviceId: string): Promise<PartyServicePage> {
  const res = await apiClient.get<ApiResponse<{ service: PartyServicePage }>>(
    `/party-services/${serviceId}`,
  );
  return mapPartyServicePage(res.data.data.service);
}
