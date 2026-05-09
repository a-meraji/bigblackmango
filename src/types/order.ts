export type OrderStatus =
  | 'pending_confirmation'
  | 'preparing'
  | 'handed_to_courier'
  | 'delivered'
  | 'cancelled';

export type ReviewStatus = 'not_applicable' | 'pending' | 'submitted';

export interface OrderAddress {
  addressLine: string;
  unit?: string;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface Order {
  id: string;
  trackingCode: string;
  status: OrderStatus;
  statusLabel: string;
  orderedAt: string;
  lastStatusChangedAt: string;
  address: OrderAddress;
  pricing: OrderPricing;
  reviewStatus: ReviewStatus;
}
