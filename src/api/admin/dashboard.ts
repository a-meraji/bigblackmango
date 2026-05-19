import { apiClient } from '../client';
import type { ApiResponse } from '@types/api';
import type { DashboardMetrics } from '@types/admin';

export async function getAdminDashboard(): Promise<DashboardMetrics> {
  const res = await apiClient.get<ApiResponse<DashboardMetrics>>('/admin/dashboard');
  return res.data.data;
}
