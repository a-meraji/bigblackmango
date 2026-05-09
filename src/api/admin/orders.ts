import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { OrderStatus } from '@types/order';

export interface AdminOrder {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  source: 'online' | 'manual';
  contact: { firstName: string; lastName: string; mobile: string };
  pricing: { subtotal: number; deliveryFee: number; total: number };
  createdAt: string;
  itemCount: number;
}

export interface AdminOrderDetail extends AdminOrder {
  items: Array<{
    menuItemId: string;
    foodName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  address: { addressLine: string; unit?: string };
  statusHistory: Array<{ status: OrderStatus; changedAt: string; note?: string }>;
  payment: { status: string; gateway?: string; gatewayReference?: string };
}

export interface ManualOrderPayload {
  customer: { firstName: string; lastName: string; mobile: string };
  address?: { addressLine: string; notes?: string };
  items: Array<{ menuItemId: string; quantity: number }>;
  paymentStatus: 'paid' | 'unpaid';
  notes?: string;
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  source?: 'online' | 'manual';
  trackingCode?: string;
  page?: number;
  limit?: number;
}

export async function adminGetOrders(
  filters?: AdminOrderFilters,
): Promise<{ items: AdminOrder[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: AdminOrder[]; meta: PaginationMeta }>>(
    '/admin/orders',
    { params: filters },
  );
  return res.data.data;
}

export async function adminGetOrderDetail(orderId: string): Promise<AdminOrderDetail> {
  const res = await apiClient.get<ApiResponse<{ order: AdminOrderDetail }>>(
    `/admin/orders/${orderId}`,
  );
  return res.data.data.order;
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrder> {
  const res = await apiClient.patch<ApiResponse<{ order: AdminOrder }>>(
    `/admin/orders/${orderId}/status`,
    { status },
  );
  return res.data.data.order;
}

export async function adminCreateManualOrder(
  payload: ManualOrderPayload,
): Promise<AdminOrder> {
  const res = await apiClient.post<ApiResponse<AdminOrder>>('/admin/orders/manual', payload);
  return res.data.data;
}
