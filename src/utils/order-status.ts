import type { OrderStatus } from '@types/order';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: 'در انتظار تایید',
  preparing: 'در حال آماده‌سازی',
  handed_to_courier: 'تحویل داده شده به پیک',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

export const VALID_NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending_confirmation: ['preparing', 'cancelled'],
  preparing: ['handed_to_courier', 'cancelled'],
  handed_to_courier: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function statusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function validNextStatuses(status: OrderStatus): OrderStatus[] {
  return VALID_NEXT_STATUSES[status] ?? [];
}
