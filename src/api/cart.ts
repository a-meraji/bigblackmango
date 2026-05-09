import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { Cart } from '@types/cart';

export async function getCart(): Promise<Cart> {
  const res = await apiClient.get<ApiResponse<{ cart: Cart }>>('/cart');
  return res.data.data.cart;
}

export async function addCartItem(payload: {
  menuItemId: string;
  quantity: number;
}): Promise<Cart> {
  const res = await apiClient.post<ApiResponse<{ cart: Cart }>>('/cart/items', payload);
  return res.data.data.cart;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const res = await apiClient.patch<ApiResponse<{ cart: Cart }>>(`/cart/items/${itemId}`, {
    quantity,
  });
  return res.data.data.cart;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const res = await apiClient.delete<ApiResponse<{ cart: Cart }>>(`/cart/items/${itemId}`);
  return res.data.data.cart;
}

export interface CartValidateResult {
  valid: boolean;
  changes: Array<{
    menuItemId: string;
    requestedQuantity: number;
    availableQuantity: number;
  }>;
}

export async function validateCart(): Promise<CartValidateResult> {
  const res = await apiClient.post<ApiResponse<CartValidateResult>>('/cart/validate');
  return res.data.data;
}
