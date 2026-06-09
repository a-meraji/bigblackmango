export type DiscountCodeType = 'percentage' | 'fixed_amount';

export interface AdminDiscountCode {
  id: string;
  code: string;
  type: DiscountCodeType;
  value: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCodePayload {
  code: string;
  type: DiscountCodeType;
  value: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  description?: string;
}

export interface DiscountValidationResult {
  discount: {
    code: string;
    type: DiscountCodeType;
    value: number;
    discountAmount: number;
  };
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    discountCode: string;
    total: number;
  };
}
