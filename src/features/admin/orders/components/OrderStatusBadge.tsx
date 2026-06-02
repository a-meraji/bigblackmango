import type { OrderStatus } from '@t/order';
import { statusLabel } from '@utils/order-status';
import styles from './OrderStatusBadge.module.css';

const VARIANT_MAP: Record<OrderStatus, string> = {
  pending_confirmation: styles.pending,
  preparing: styles.preparing,
  handed_to_courier: styles.dispatch,
  delivered: styles.delivered,
  cancelled: styles.cancelled,
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${styles.badge} ${VARIANT_MAP[status]}`}>{statusLabel(status)}</span>
  );
}
