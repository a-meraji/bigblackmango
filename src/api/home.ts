import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { HomePayload } from '@types/home';
import type { Story } from '@types/home';

export async function getHome(): Promise<HomePayload> {
  const res = await apiClient.get<ApiResponse<HomePayload>>('/home');
  return res.data.data;
}

export async function getStories(): Promise<Story[]> {
  const res = await apiClient.get<ApiResponse<{ stories: Story[] }>>('/stories');
  return res.data.data.stories;
}
