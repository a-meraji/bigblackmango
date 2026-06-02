import { apiClient } from './client';
import type { ApiResponse } from '@t/api';
import type { CheckoutPayload, CheckoutResponse } from '@t/checkout';

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

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PaymentVerifyResult {
  checkoutId: string;
  checkoutStatus: 'paid' | 'canceled';
  orderId?: string;
  trackingCode?: string;
  paymentStatus?: string;
  receipt?: { items: ReceiptItem[]; total: number };
}

export async function verifyPayment(
  paymentId: string,
  gatewayReference: string,
  status: 'success' | 'failed',
): Promise<PaymentVerifyResult> {
  const res = await apiClient.post<ApiResponse<PaymentVerifyResult>>('/payments/verify', {
    paymentId,
    gatewayReference,
    status,
  });
  return res.data.data;
}
