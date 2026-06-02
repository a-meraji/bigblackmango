import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { validateCurrentCart } from '@features/customer/cart/cart-operations';
import { submitCheckout } from '@api/checkout';
import PageShell from '@components/page-shell/PageShell';
import CheckoutSteps from '@components/checkout-steps/CheckoutSteps';
import DeliveryForm from '@features/customer/checkout/components/DeliveryForm';
import CheckoutAuthGate from '@features/customer/checkout/components/CheckoutAuthGate';
import StockConflictAlert from '@features/customer/checkout/components/StockConflictAlert';
import { useToast } from '@hooks/useToast';
import type { CheckoutPayload } from '@t/checkout';
import styles from './CheckoutPage.module.css';

type Step = 'auth' | 'delivery' | 'submitting';

export default function CheckoutPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<Step>(() => (isAuthenticated ? 'delivery' : 'auth'));
  const [stockConflicts, setStockConflicts] = useState<
    Array<{ menuItemId: string; requestedQuantity: number; availableQuantity: number }>
  >([]);

  const checkoutStep = step === 'auth' ? 'auth' : step === 'submitting' ? 'payment' : 'delivery';

  async function proceedToCheckout(payload: CheckoutPayload) {
    setStep('submitting');
    setStockConflicts([]);

    const validation = await validateCurrentCart();
    if (!validation.valid) {
      setStockConflicts(validation.changes);
      setStep('delivery');
      return;
    }

    try {
      const checkout = await submitCheckout(payload);
      navigate(`/payment?checkoutId=${checkout.id}`);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      if (apiErr.code === 'OUT_OF_STOCK' && Array.isArray((err as { details?: unknown }).details)) {
        setStockConflicts((err as { details: typeof stockConflicts }).details ?? []);
      } else if (apiErr.code === 'CHECKOUT_INVALID_STATE') {
        toast.error('سبد خرید نامعتبر است. لطفاً دوباره تلاش کنید.');
      } else {
        toast.error(apiErr.message ?? 'خطا در ثبت سفارش. دوباره تلاش کنید.');
      }
      setStep('delivery');
    }
  }

  async function handleDeliverySubmit(payload: CheckoutPayload) {
    await proceedToCheckout(payload);
  }

  return (
    <PageShell narrow>
      <h1 className={styles.title}>تکمیل سفارش</h1>
      <CheckoutSteps current={checkoutStep} skipAuth={isAuthenticated} />

      {stockConflicts.length > 0 && (
        <StockConflictAlert conflicts={stockConflicts} onDismiss={() => setStockConflicts([])} />
      )}

      {step === 'auth' && (
        <CheckoutAuthGate onSuccess={() => setStep('delivery')} onBack={() => navigate(-1)} />
      )}

      {(step === 'delivery' || step === 'submitting') && isAuthenticated && (
        <DeliveryForm onSubmit={handleDeliverySubmit} loading={step === 'submitting'} />
      )}
    </PageShell>
  );
}
