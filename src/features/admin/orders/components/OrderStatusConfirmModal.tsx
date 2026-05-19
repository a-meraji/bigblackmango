import { ArrowLeft } from 'lucide-react';
import Modal from '@components/modal/Modal';
import Button from '@components/button/Button';
import Icon from '@components/icon/Icon';
import type { OrderStatus } from '@types/order';
import { statusLabel } from '@utils/order-status';
import OrderStatusBadge from './OrderStatusBadge';
import styles from './OrderStatusConfirmModal.module.css';

export interface OrderStatusConfirmPayload {
  orderId: string;
  trackingCode: string;
  currentStatus: OrderStatus;
  nextStatus: OrderStatus;
}

interface Props {
  open: boolean;
  payload: OrderStatusConfirmPayload | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OrderStatusConfirmModal({
  open,
  payload,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  if (!payload) {
    return null;
  }

  const isCancel = payload.nextStatus === 'cancelled';

  return (
    <Modal
      isOpen={open}
      onClose={loading ? () => undefined : onClose}
      title="تأیید تغییر وضعیت"
      size="sm"
    >
      <div className={styles.content}>
        <p className={styles.lead}>
          آیا وضعیت سفارش{' '}
          <span className={styles.tracking} dir="ltr">
            {payload.trackingCode}
          </span>{' '}
          را تغییر می‌دهید؟
        </p>

        <div className={styles.transition} aria-label="انتقال وضعیت">
          <p className={styles.transitionLabel}>از</p>
          <div className={styles.statusRow}>
            <OrderStatusBadge status={payload.currentStatus} />
            <Icon icon={ArrowLeft} size="sm" className={styles.arrow} decorative />
            <OrderStatusBadge status={payload.nextStatus} />
          </div>
        </div>

        {isCancel && (
          <p className={styles.warning} role="note">
            با لغو سفارش، این سفارش به وضعیت نهایی می‌رود و دیگر قابل تغییر نیست.
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button
            type="button"
            variant={isCancel ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {statusLabel(payload.nextStatus)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
