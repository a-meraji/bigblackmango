import { apiClient } from './client';
import type { ApiResponse } from '@types/api';
import type { CheckoutPayload, CheckoutResponse } from '@types/checkout';

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const res = await apiClient.post<ApiResponse<{ checkout: CheckoutResponse }>>(
    '/checkout',
    payload,
  );
  return res.data.data.checkout;
}

export interface InitiatePaymentResult {
  paymentId: string;
  gateway: string;
  paymentUrl: string;
}

export async function initiatePayment(checkoutId: string): Promise<InitiatePaymentResult> {
  const res = await apiClient.post<ApiResponse<InitiatePaymentResult>>('/payments/initiate', {
    checkoutId,
  });
  return res.data.data;
}

export interface VerifyPaymentResult {
  checkoutId: string;
  checkoutStatus: 'paid' | 'canceled';
  orderId?: string;
  trackingCode?: string;
  paymentStatus?: string;
  receipt?: { items: unknown[]; total: number };
}

export async function verifyPayment(payload: {
  paymentId: string;
  gatewayReference: string;
  status: 'success' | 'failed';
}): Promise<VerifyPaymentResult> {
  const res = await apiClient.post<ApiResponse<VerifyPaymentResult>>('/payments/verify', payload);
  return res.data.data;
}
