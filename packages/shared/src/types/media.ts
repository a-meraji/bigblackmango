export type MediaAssetType = 'image' | 'video';

export interface MediaAsset {
  id: string;
  path: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  folder: string;
  type: MediaAssetType;
  createdAt: string;
}

export interface MediaAssetListResponse {
  items: MediaAsset[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
