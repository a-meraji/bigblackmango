import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { getOrders, getOrderReceipt } from '@api/orders';
import PageShell from '@components/page-shell/PageShell';
import EmptyState from '@components/empty-state/EmptyState';
import Skeleton from '@components/skeleton/Skeleton';
import OrderCard from '@features/customer/orders/components/OrderCard';
import ReceiptModal from '@features/customer/orders/components/ReceiptModal';
import { PENDING_RECEIPT_KEY } from '@constants/payment';
import styles from './OrdersPage.module.css';

type Tab = 'current' | 'past';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('current');
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', tab],
    queryFn: () => getOrders({ tab }),
  });

  const { data: receipt, isLoading: receiptLoading } = useQuery({
    queryKey: ['receipt', receiptOrderId],
    queryFn: () => getOrderReceipt(receiptOrderId!),
    enabled: !!receiptOrderId,
  });

  useEffect(() => {
    const pendingId = localStorage.getItem(PENDING_RECEIPT_KEY);
    if (pendingId) {
      localStorage.removeItem(PENDING_RECEIPT_KEY);
      setReceiptOrderId(pendingId);
    }
  }, []);

  const orders = data?.items ?? [];

  return (
    <PageShell narrow>
      <h1 className={styles.title}>سفارش‌های من</h1>

      <div className={styles.tabs} role="tablist">
        {(['current', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`${styles.tab} ${tab === t ? styles.active : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'current' ? 'جاری' : 'گذشته'}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={styles.loading} role="status" aria-label="در حال بارگذاری">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={120} borderRadius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title={tab === 'current' ? 'سفارش فعالی ندارید' : 'تاریخچه‌ای وجود ندارد'}
          description={
            tab === 'current'
              ? 'پس از ثبت سفارش، وضعیت آن را اینجا می‌بینید.'
              : 'سفارش‌های تحویل‌شده و گذشته اینجا نمایش داده می‌شوند.'
          }
          actionLabel={tab === 'current' ? 'سفارش دهید' : undefined}
          onAction={tab === 'current' ? () => navigate('/') : undefined}
        />
      )}

      <ul className={styles.list}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onShowReceipt={() => setReceiptOrderId(order.id)} />
        ))}
      </ul>

      {receiptOrderId && receipt && !receiptLoading && (
        <ReceiptModal isOpen onClose={() => setReceiptOrderId(null)} receipt={receipt} />
      )}
    </PageShell>
  );
}
