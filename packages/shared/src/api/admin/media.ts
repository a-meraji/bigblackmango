import { apiClient } from '../client';
import type { ApiResponse } from '@t/api';
import type { MediaAsset, MediaAssetListResponse, MediaAssetType } from '@t/media';

export async function listMediaAssets(params: {
  type?: MediaAssetType;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<MediaAssetListResponse> {
  const res = await apiClient.get<
    ApiResponse<{ items: MediaAsset[] }> & { meta?: MediaAssetListResponse['meta'] }
  >('/admin/media', { params });

  return {
    items: res.data.data.items,
    meta: (res.data.meta ?? { page: 1, limit: 20, total: res.data.data.items.length }) as MediaAssetListResponse['meta'],
  };
}

export async function deleteMediaAsset(assetId: string): Promise<void> {
  await apiClient.delete(`/admin/media/${assetId}`);
}
