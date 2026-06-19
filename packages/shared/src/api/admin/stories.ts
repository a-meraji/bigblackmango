import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@t/api';
import type { AdminStory } from '@t/admin-content';

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
  expired?: boolean;
  isActive?: boolean;
}): Promise<{ items: AdminStory[]; meta: PaginationMeta }> {
  const res = await apiClient.get<
    ApiResponse<{ items: AdminStory[] }>
  >('/admin/stories', { params });
  return {
    items: res.data.data.items,
    meta: (res.data.meta ?? { page: 1, limit: 100, total: res.data.data.items.length }) as PaginationMeta,
  };
}

export async function adminListStories(params?: {
  expired?: boolean;
  isActive?: boolean;
}): Promise<AdminStory[]> {
  const { items } = await adminGetStories({ limit: 100, ...params });
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

export async function adminReactivateStory(
  storyId: string,
  expiresAt?: string,
): Promise<AdminStory> {
  const res = await apiClient.post<ApiResponse<{ story: AdminStory }>>(
    `/admin/stories/${storyId}/reactivate`,
    expiresAt ? { expiresAt } : {},
  );
  return res.data.data.story;
}
