import type { Order, OrderStatus } from '@t/order';
import { toJalaliWithTime } from '@utils/format-date';
import clsx from 'clsx';
import StatusIllustration from './StatusIllustration';
import styles from './OrderCard.module.css';
import { formatNumber, formatDigits } from '@utils/locale';

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending_confirmation: styles.statusPending,
  preparing:           styles.statusPreparing,
  handed_to_courier:   styles.statusReady,
  delivered:           styles.statusDelivered,
  cancelled:           styles.statusCancelled,
};

interface Props {
  order: Order;
  onShowReceipt: () => void;
}

export default function OrderCard({ order, onShowReceipt }: Props) {
  const itemsText =
    order.itemsPreview
      ?.map((i) => `${i.foodName} × ${formatNumber(i.quantity)}`)
      .join(' · ') ?? order.address.addressLine;

  return (
    <li className={styles.card} data-status={order.status}>
      <div className={styles.header}>
        <span className={styles.tracking} dir="ltr">
          #{formatDigits(order.trackingCode)}
        </span>
        <span className={clsx(styles.status, STATUS_CLASS[order.status])}>
          {order.statusLabel}
        </span>
      </div>

      <div className={styles.illustration}>
        <StatusIllustration status={order.status} size={64} />
        <span className={styles.statusLabel}>{order.statusLabel}</span>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className={styles.metaDate} dir="rtl">{toJalaliWithTime(order.orderedAt)}</span>
        </div>

        {itemsText && itemsText !== '—' && (
          <div className={styles.metaRow}>
            <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M5 2v5a3 3 0 006 0V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="7" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className={styles.metaItems}>{itemsText}</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.receiptBtn} onClick={onShowReceipt}>
          مشاهده رسید
        </button>
      </div>
    </li>
  );
}
