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
  discountAmount?: number;
  discountCode?: string | null;
  total: number;
}

export interface OrderItemLine {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number | null;
  menuDiscountPercent?: number | null;
  lineTotal: number;
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
  itemsPreview?: Array<{ foodName: string; quantity: number }>;
}

export interface OrderDetail extends Order {
  items: OrderItemLine[];
  reviewPrompt: { canReview: boolean; promptShown: boolean };
}
