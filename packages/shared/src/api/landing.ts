import { apiClient } from './client';
import type { ApiResponse } from '@t/api';
import type { LandingPayload } from '@t/landing';

export async function getLanding(): Promise<LandingPayload> {
  const res = await apiClient.get<ApiResponse<LandingPayload>>('/landing');
  return res.data.data;
}
