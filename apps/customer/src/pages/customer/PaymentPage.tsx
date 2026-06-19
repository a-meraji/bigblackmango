import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CircleAlert, Loader2 } from 'lucide-react';
import { initiatePayment } from '@api/checkout';
import { completePaymentRedirect } from '@utils/payment-redirect';
import PageShell from '@components/page-shell/PageShell';
import EmptyState from '@components/empty-state/EmptyState';
import Icon from '@components/icon/Icon';
import Button from '@components/button/Button';
import styles from './PaymentPage.module.css';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkoutId = searchParams.get('checkoutId');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!checkoutId) {
      navigate('/');
      return;
    }

    initiatePayment(checkoutId)
      .then(({ paymentId, paymentUrl }) => {
        completePaymentRedirect({ paymentUrl, paymentId, navigate });
      })
      .catch(() => {
        setError('خطا در اتصال به درگاه پرداخت. دوباره تلاش کنید.');
      });
  }, [checkoutId, navigate]);

  if (error) {
    return (
      <PageShell narrow>
        <EmptyState
          icon={CircleAlert}
          title="خطا در اتصال به درگاه"
          description={error}
          actionLabel="بازگشت"
          onAction={() => navigate(-1)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell narrow className={styles.loading}>
      <Icon icon={Loader2} size="lg" className={styles.spin} decorative />
      <p role="status">در حال اتصال به درگاه پرداخت...</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>
        انصراف
      </Button>
    </PageShell>
  );
}
