import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { AdminStory } from '@types/admin-content';

export interface StoryPayload {
  title?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'image' | 'video';
  expiresAt?: string;
  isActive?: boolean;
}

export async function adminGetStories(params?: {
  page?: number;
  limit?: number;
}): Promise<{ items: AdminStory[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: AdminStory[]; meta: PaginationMeta }>>(
    '/admin/stories',
    { params },
  );
  return res.data.data;
}

export async function adminListStories(): Promise<AdminStory[]> {
  const { items } = await adminGetStories({ limit: 100 });
  return items;
}

export async function adminCreateStory(payload: StoryPayload): Promise<AdminStory> {
  const res = await apiClient.post<ApiResponse<{ story: AdminStory }>>('/admin/stories', payload);
  return res.data.data.story;
}

export async function adminUpdateStory(
  storyId: string,
  payload: Partial<StoryPayload>,
): Promise<AdminStory> {
  const res = await apiClient.patch<ApiResponse<{ story: AdminStory }>>(
    `/admin/stories/${storyId}`,
    payload,
  );
  return res.data.data.story;
}

export async function adminDeleteStory(storyId: string): Promise<void> {
  await apiClient.delete(`/admin/stories/${storyId}`);
}
