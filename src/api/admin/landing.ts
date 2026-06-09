import { apiClient } from '../client';
import type { ApiResponse } from '@t/api';
import type { AdminLandingPage, UpdateLandingPayload } from '@t/landing';

export async function adminGetLanding(): Promise<AdminLandingPage> {
  const res = await apiClient.get<ApiResponse<{ landing: AdminLandingPage }>>('/admin/landing');
  return res.data.data.landing;
}

export async function adminUpdateLanding(
  payload: UpdateLandingPayload,
): Promise<AdminLandingPage> {
  const res = await apiClient.patch<ApiResponse<{ landing: AdminLandingPage }>>(
    '/admin/landing',
    payload,
  );
  return res.data.data.landing;
}
