import { apiClient } from './client';
import type { ApiResponse } from '@t/api';

export type UploadFolder =
  | 'foods'
  | 'stories'
  | 'banners'
  | 'party-services'
  | 'party-service-highlights'
  | 'categories'
  | 'general';

interface UploadFileResponse {
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

  const res = await apiClient.post<ApiResponse<UploadFileResponse>>('/uploads/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data.file.path;
}

export function checkVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Cannot read video metadata'));
    };
    video.src = url;
  });
}

export async function uploadVideo(
  file: File,
  folder: UploadFolder = 'party-service-highlights',
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await apiClient.post<ApiResponse<UploadFileResponse>>('/uploads/video', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data.file.path;
}
