import { apiClient } from './client';
import type { ApiResponse } from '@t/api';
import type { HomePayload } from '@t/home';
import type { Story } from '@t/home';

export async function getHome(): Promise<HomePayload> {
  const res = await apiClient.get<ApiResponse<HomePayload>>('/home');
  return res.data.data;
}

export async function getStories(): Promise<Story[]> {
  const res = await apiClient.get<ApiResponse<Story[]>>('/stories');
  return res.data.data;
}
