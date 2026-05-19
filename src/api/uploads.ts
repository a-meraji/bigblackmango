import { apiClient } from './client';
import type { ApiResponse } from '@types/api';

export type UploadFolder = 'foods' | 'stories' | 'banners' | 'party-services' | 'general';

interface UploadImageResponse {
  file: {
    url: string;
    path: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    folder: UploadFolder;
  };
}

export async function uploadImage(file: File, folder: UploadFolder = 'foods'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await apiClient.post<ApiResponse<UploadImageResponse>>('/uploads/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data.file.path;
}
