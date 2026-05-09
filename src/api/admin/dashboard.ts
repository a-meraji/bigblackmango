import { apiClient } from '../client';
import type { ApiResponse } from '@types/api';

export interface DashboardKpis {
  todayOrders: number;
  pendingOrders: number;
  todaySales: number;
  lowStockCount: number;
  pendingReviewIssues: number;
  partyServiceInquiries: number;
}

export async function getAdminDashboard(): Promise<DashboardKpis> {
  const res = await apiClient.get<ApiResponse<DashboardKpis>>('/admin/dashboard');
  return res.data.data;
}
