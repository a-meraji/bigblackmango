export interface CartItemFood {
  id: string;
  name: string;
  thumbnailUrl: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  food: CartItemFood;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}
