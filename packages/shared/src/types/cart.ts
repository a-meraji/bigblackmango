export interface CartFoodSummary {
  id: string;
  name: string;
  thumbnailUrl: string | null;
}

/** @deprecated Use CartFoodSummary */
export type CartItemFood = CartFoodSummary;

export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  menuDiscountPercent?: number | null;
  lineTotal: number;
  food: CartFoodSummary;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}
