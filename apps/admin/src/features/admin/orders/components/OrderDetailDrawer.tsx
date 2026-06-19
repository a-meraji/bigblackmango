import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { adminGetOrderDetail } from '@api/admin/orders';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
import { formatPrice } from '@utils/format-price';
import { toJalaliWithTime } from '@utils/format-date';
import type { OrderStatus } from '@t/order';
import OrderStatusBadge from './OrderStatusBadge';
import StatusTransitionButtons from './StatusTransitionButtons';
import Skeleton from '@components/skeleton/Skeleton';
import styles from './OrderDetailDrawer.module.css';
import { formatNumber, formatDigits } from '@utils/locale';

interface OrderDetailDrawerProps {
  orderId: string;
  onClose: () => void;
  onStatusChange: (change: {
    nextStatus: OrderStatus;
    trackingCode: string;
    currentStatus: OrderStatus;
  }) => void;
  statusLoading?: boolean;
}

function paymentLabel(status: string): string {
  if (status === 'paid') return 'پرداخت‌شده';
  if (status === 'unpaid') return 'پرداخت‌نشده';
  return status;
}

export default function OrderDetailDrawer({
  orderId,
  onClose,
  onStatusChange,
  statusLoading = false,
}: OrderDetailDrawerProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => adminGetOrderDetail(orderId),
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="order-drawer-title" className={styles.title}>
            جزئیات سفارش
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="بستن">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {isLoading && (
          <div className={styles.loading}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={80} />
            <Skeleton height={120} />
          </div>
        )}

        {order && (
          <div className={styles.body}>
            <div className={styles.trackingRow}>
              <span className={styles.tracking} dir="ltr">
                {formatDigits(order.trackingCode)}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>مشتری</h3>
              <p>{order.contact.displayName}</p>
              {order.contact.mobile && (
                <p dir="ltr" className={styles.mobile}>
                  {formatDigits(order.contact.mobile)}
                </p>
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>آدرس</h3>
              <p>{order.address.addressLine}</p>
              {order.address.unit && <p>واحد: {order.address.unit}</p>}
              {order.address.notes && (
                <p className={styles.muted}>{order.address.notes}</p>
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>اقلام</h3>
              <ul className={styles.items}>
                {order.items.map((item) => {
                  const hasMenuDiscount =
                    item.menuDiscountPercent != null &&
                    item.originalUnitPrice != null &&
                    item.unitPrice < item.originalUnitPrice;

                  return (
                    <li key={item.id} className={styles.item}>
                      <div className={styles.itemMain}>
                        <span>
                          {item.foodName} × {formatNumber(item.quantity)}
                        </span>
                        {hasMenuDiscount && (
                          <PriceWithDiscount
                            originalPrice={item.originalUnitPrice!}
                            salePrice={item.unitPrice}
                            discountPercent={item.menuDiscountPercent}
                            size="sm"
                            layout="inline"
                          />
                        )}
                      </div>
                      <span dir="ltr">{formatPrice(item.lineTotal)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.pricing}>
                <div className={styles.pricingRow}>
                  <span>جمع جزء</span>
                  <span dir="ltr">{formatPrice(order.subtotal)}</span>
                </div>
                <div className={styles.pricingRow}>
                  <span>هزینه ارسال</span>
                  <span dir="ltr">{formatPrice(order.deliveryFee)}</span>
                </div>
                {(order.discountAmount ?? 0) > 0 && (
                  <div className={styles.pricingRow}>
                    <span>
                      تخفیف
                      {order.discountCode ? ` (${order.discountCode})` : ''}
                    </span>
                    <span dir="ltr">−{formatPrice(order.discountAmount ?? 0)}</span>
                  </div>
                )}
                <div className={`${styles.pricingRow} ${styles.totalRow}`}>
                  <span>جمع کل</span>
                  <span dir="ltr">{formatPrice(order.total)}</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>پرداخت</h3>
              <p>
                وضعیت سفارش: {paymentLabel(order.paymentStatus)}
                {order.payment && (
                  <>
                    {' '}
                    · درگاه: {order.payment.gateway} · {paymentLabel(order.payment.status)}
                  </>
                )}
              </p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>تغییر وضعیت</h3>
              <StatusTransitionButtons
                currentStatus={order.status}
                onTransition={(nextStatus) =>
                  onStatusChange({
                    nextStatus,
                    trackingCode: order.trackingCode,
                    currentStatus: order.status,
                  })
                }
                loading={statusLoading}
              />
            </section>

            <p className={styles.date}>
              ثبت: {toJalaliWithTime(order.orderedAt)}
              <br />
              آخرین تغییر: {toJalaliWithTime(order.lastStatusChangedAt)}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
