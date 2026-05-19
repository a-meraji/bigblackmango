import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CircleX, Loader2 } from 'lucide-react';
import { verifyPayment } from '@api/checkout';
import { useCartStore } from '@store/cart.store';
import { useQueryClient } from '@tanstack/react-query';
import { PENDING_PAYMENT_ID_KEY, PENDING_RECEIPT_KEY } from '../../constants/payment';
import PageShell from '@components/page-shell/PageShell';
import EmptyState from '@components/empty-state/EmptyState';
import Icon from '@components/icon/Icon';
import styles from './PaymentCallbackPage.module.css';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clearCart);
  const qc = useQueryClient();
  const [status, setStatus] = useState<'verifying' | 'failed'>('verifying');
  const verifyStartedRef = useRef(false);

  useEffect(() => {
    if (verifyStartedRef.current) {
      return;
    }
    verifyStartedRef.current = true;

    const paymentId =
      searchParams.get('paymentId') ??
      sessionStorage.getItem(PENDING_PAYMENT_ID_KEY) ??
      '';
    const ref = searchParams.get('Authority') ?? searchParams.get('ref') ?? '';
    const rawStatus = searchParams.get('Status') ?? searchParams.get('status') ?? '';
    const isSuccess = rawStatus === 'OK' || rawStatus === 'success';

    if (!paymentId) {
      setStatus('failed');
      return;
    }

    verifyPayment(paymentId, ref, isSuccess ? 'success' : 'failed')
      .then((result) => {
        sessionStorage.removeItem(PENDING_PAYMENT_ID_KEY);

        if (result.checkoutStatus === 'paid' && result.orderId) {
          clearCart();
          qc.removeQueries({ queryKey: ['cart'] });
          localStorage.setItem(PENDING_RECEIPT_KEY, result.orderId);
          navigate('/orders', { replace: true });
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('failed'));
  }, [searchParams, navigate, clearCart, qc]);

  if (status === 'failed') {
    return (
      <PageShell narrow>
        <EmptyState
          icon={CircleX}
          title="پرداخت ناموفق"
          description="متأسفانه پرداخت انجام نشد. سفارش شما ثبت نشده است."
          actionLabel="بازگشت به منو"
          onAction={() => navigate('/')}
        />
      </PageShell>
    );
  }

  return (
    <PageShell narrow className={styles.verifying}>
      <Icon icon={Loader2} size="lg" className={styles.spin} decorative />
      <p role="status">در حال تایید پرداخت...</p>
    </PageShell>
  );
}
