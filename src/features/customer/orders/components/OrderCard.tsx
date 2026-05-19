import type { Order, OrderStatus } from '@types/order';
import { formatPrice } from '@utils/format-price';
import { toJalaliWithTime } from '@utils/format-date';
import clsx from 'clsx';
import styles from './OrderCard.module.css';

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending_confirmation: styles.statusPending,
  preparing: styles.statusPreparing,
  handed_to_courier: styles.statusReady,
  delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
};

interface Props {
  order: Order;
  onShowReceipt: () => void;
}

export default function OrderCard({ order, onShowReceipt }: Props) {
  const preview =
    order.itemsPreview?.map((i) => `${i.foodName} × ${i.quantity.toLocaleString('fa-IR')}`).join(' · ') ??
    order.address.addressLine;

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tracking} dir="ltr">
          {order.trackingCode}
        </span>
        <span className={clsx(styles.status, STATUS_CLASS[order.status])}>
          {order.statusLabel}
        </span>
      </div>

      <div className={styles.details}>
        <span className={styles.date}>{toJalaliWithTime(order.orderedAt)}</span>
        {preview && preview !== '—' && <span className={styles.preview}>{preview}</span>}
      </div>

      <div className={styles.footer}>
        <span className={styles.total}>{formatPrice(order.pricing.total)}</span>
        <button type="button" className={styles.receiptBtn} onClick={onShowReceipt}>
          مشاهده رسید
        </button>
      </div>
    </li>
  );
}
