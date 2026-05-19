import { apiClient } from '../client';
import type { ApiResponse, PaginationMeta } from '@types/api';
import type { OrderStatus } from '@types/order';
import {
  parseAddressSnapshot,
  parseContactSnapshot,
} from '@utils/admin-order-snapshot';

export interface AdminOrderListItem {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  paymentStatus: string;
  total: number;
  orderedAt: string;
  lastStatusChangedAt: string;
  customer: {
    fullName: string;
    mobile: string | null;
  };
  itemsPreview: Array<{ foodName: string; quantity: number }>;
}

export interface AdminOrderDetailView extends AdminOrderListItem {
  subtotal: number;
  deliveryFee: number;
  contact: ReturnType<typeof parseContactSnapshot>;
  address: ReturnType<typeof parseAddressSnapshot>;
  items: Array<{
    id: string;
    foodId: string;
    menuItemId: string | null;
    foodName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  payment: {
    id: string;
    gateway: string;
    status: string;
    paidAt: string | null;
  } | null;
}

export interface ManualOrderPayload {
  customer: { firstName: string; lastName: string; mobile: string };
  address: {
    addressLine: string;
    unit?: string;
    postalCode?: string;
    notes?: string;
  };
  items: Array<{ menuItemId: string; quantity: number }>;
  paymentStatus: 'paid' | 'unpaid';
  notes?: string;
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  paymentStatus?: 'paid' | 'unpaid';
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

type RawOrderSummary = {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  paymentStatus: string;
  total: number;
  orderedAt: string;
  lastStatusChangedAt: string;
  customer: { fullName: string; mobile: string | null };
  itemsPreview: Array<{ foodName: string; quantity: number }>;
};

type RawOrderDetail = {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderedAt: string;
  lastStatusChangedAt: string;
  address: unknown;
  contact: unknown;
  items: AdminOrderDetailView['items'];
  payment: AdminOrderDetailView['payment'];
};

function mapListItem(raw: RawOrderSummary): AdminOrderListItem {
  return {
    id: raw.id,
    trackingCode: raw.trackingCode,
    status: raw.status,
    paymentStatus: raw.paymentStatus,
    total: raw.total,
    orderedAt: raw.orderedAt,
    lastStatusChangedAt: raw.lastStatusChangedAt,
    customer: raw.customer,
    itemsPreview: raw.itemsPreview,
  };
}

function mapDetail(raw: RawOrderDetail): AdminOrderDetailView {
  const contact = parseContactSnapshot(raw.contact);
  return {
    id: raw.id,
    trackingCode: raw.trackingCode,
    status: raw.status,
    paymentStatus: raw.paymentStatus,
    total: raw.total,
    orderedAt: raw.orderedAt,
    lastStatusChangedAt: raw.lastStatusChangedAt,
    customer: {
      fullName: contact.displayName,
      mobile: contact.mobile || null,
    },
    itemsPreview: raw.items.map((item) => ({
      foodName: item.foodName,
      quantity: item.quantity,
    })),
    subtotal: raw.subtotal,
    deliveryFee: raw.deliveryFee,
    contact,
    address: parseAddressSnapshot(raw.address),
    items: raw.items,
    payment: raw.payment,
  };
}

export async function adminGetOrders(
  filters?: AdminOrderFilters,
): Promise<{ items: AdminOrderListItem[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<{ items: RawOrderSummary[] }>>('/admin/orders', {
    params: filters,
  });
  return {
    items: res.data.data.items.map(mapListItem),
    meta: (res.data.meta ?? { page: 1, limit: 20, total: 0 }) as PaginationMeta,
  };
}

export async function adminGetOrderDetail(orderId: string): Promise<AdminOrderDetailView> {
  const res = await apiClient.get<ApiResponse<{ order: RawOrderDetail }>>(
    `/admin/orders/${orderId}`,
  );
  return mapDetail(res.data.data.order);
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrderListItem> {
  const res = await apiClient.patch<ApiResponse<{ order: RawOrderSummary }>>(
    `/admin/orders/${orderId}/status`,
    { status },
  );
  return mapListItem(res.data.data.order);
}

export async function adminCreateManualOrder(
  payload: ManualOrderPayload,
): Promise<AdminOrderDetailView> {
  const res = await apiClient.post<ApiResponse<{ order: RawOrderDetail }>>(
    '/admin/orders/manual',
    payload,
  );
  return mapDetail(res.data.data.order);
}
