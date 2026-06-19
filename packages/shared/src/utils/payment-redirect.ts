import type { NavigateFunction } from 'react-router-dom';

import { PENDING_PAYMENT_ID_KEY } from '../constants/payment';

/**
 * Sends the user to the payment gateway, or to our SPA callback route.
 * In dev, mock callbacks use client-side navigation on the current origin so a
 * mismatched CLIENT_APP_URL / CORS port (e.g. 3001 vs 5173) cannot break the flow.
 */
export function completePaymentRedirect({
  paymentUrl,
  paymentId,
  navigate,
}: {
  paymentUrl: string;
  paymentId: string;
  navigate: NavigateFunction;
}) {
  sessionStorage.setItem(PENDING_PAYMENT_ID_KEY, paymentId);

  let callbackUrl: URL;

  try {
    callbackUrl = new URL(paymentUrl);
  } catch {
    window.location.assign(paymentUrl);
    return;
  }

  const isClientCallback = callbackUrl.pathname.endsWith('/payment/callback');

  if (!isClientCallback) {
    window.location.assign(paymentUrl);
    return;
  }

  callbackUrl.searchParams.set('paymentId', paymentId);
  const callbackPath = `/payment/callback${callbackUrl.search}`;

  if (import.meta.env.DEV || callbackUrl.origin === window.location.origin) {
    navigate(callbackPath, { replace: true });
    return;
  }

  window.location.assign(callbackUrl.toString());
}
