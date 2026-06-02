import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminPartyServiceHighlight } from '@t/admin-content';

export interface PartyServiceHighlightPayload {
  servicePageId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  sortOrder?: number;
  isActive: boolean;
}

type RawHighlight = {
  id: string;
  servicePageId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

function mapHighlight(raw: RawHighlight): AdminPartyServiceHighlight {
  return {
    id: raw.id,
    servicePageId: raw.servicePageId,
    title: raw.title,
    videoUrl: raw.videoUrl,
    thumbnailUrl: raw.thumbnailUrl,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
  };
}

export async function adminListHighlights(
  servicePageId: string,
): Promise<AdminPartyServiceHighlight[]> {
  const res = await apiClient.get<
    ApiResponse<{ items: RawHighlight[]; meta: PaginationMeta }>
  >('/admin/party-service-highlights', {
    params: { servicePageId, limit: 100 },
  });
  return res.data.data.items.map(mapHighlight);
}

export async function adminCreateHighlight(
  payload: PartyServiceHighlightPayload,
): Promise<AdminPartyServiceHighlight> {
  const res = await apiClient.post<ApiResponse<{ highlight: RawHighlight }>>(
    '/admin/party-service-highlights',
    payload,
  );
  return mapHighlight(res.data.data.highlight);
}

export async function adminUpdateHighlight(
  id: string,
  payload: Partial<PartyServiceHighlightPayload>,
): Promise<AdminPartyServiceHighlight> {
  const res = await apiClient.patch<ApiResponse<{ highlight: RawHighlight }>>(
    `/admin/party-service-highlights/${id}`,
    payload,
  );
  return mapHighlight(res.data.data.highlight);
}

export async function adminDeleteHighlight(id: string): Promise<void> {
  await apiClient.delete(`/admin/party-service-highlights/${id}`);
}
