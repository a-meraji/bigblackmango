import clsx from 'clsx';
import { validNextStatuses, statusLabel } from '@utils/order-status';
import type { OrderStatus } from '@t/order';
import styles from './StatusTransitionButtons.module.css';

const TRANSITION_VARIANT: Record<OrderStatus, string> = {
  pending_confirmation: styles.confirm,
  preparing: styles.preparing,
  handed_to_courier: styles.dispatch,
  delivered: styles.delivered,
  cancelled: styles.cancel,
};

interface StatusTransitionButtonsProps {
  currentStatus: OrderStatus;
  onTransition: (status: OrderStatus) => void;
  loading?: boolean;
}

export default function StatusTransitionButtons({
  currentStatus,
  onTransition,
  loading = false,
}: StatusTransitionButtonsProps) {
  const nextStatuses = validNextStatuses(currentStatus);

  if (nextStatuses.length === 0) {
    return <span className={styles.terminal}>—</span>;
  }

  return (
    <div className={styles.buttons}>
      {nextStatuses.map((status) => (
        <button
          key={status}
          type="button"
          className={clsx(styles.btn, TRANSITION_VARIANT[status])}
          onClick={() => onTransition(status)}
          disabled={loading}
        >
          {statusLabel(status)}
        </button>
      ))}
    </div>
  );
}
