import { formatPrice } from '@utils/format-price';
import styles from './CheckoutOrderSummary.module.css';

interface Pricing {
  subtotal: number;
  deliveryFee: number;
  discountAmount?: number;
  discountCode?: string | null;
  total: number;
}

interface Props {
  pricing: Pricing;
}

export default function CheckoutOrderSummary({ pricing }: Props) {
  const hasDiscount = (pricing.discountAmount ?? 0) > 0;

  return (
    <section className={styles.summary} aria-label="خلاصه سفارش">
      <h2 className={styles.title}>خلاصه سفارش</h2>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span>جمع خرید</span>
          <span>{formatPrice(pricing.subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>هزینه ارسال</span>
          <span>{formatPrice(pricing.deliveryFee)}</span>
        </div>
        {hasDiscount && (
          <div className={`${styles.row} ${styles.discount}`}>
            <span>
              تخفیف
              {pricing.discountCode ? ` (${pricing.discountCode})` : ''}
            </span>
            <span dir="ltr">−{formatPrice(pricing.discountAmount ?? 0)}</span>
          </div>
        )}
        <div className={`${styles.row} ${styles.total}`}>
          <span>مبلغ قابل پرداخت</span>
          <span>{formatPrice(pricing.total)}</span>
        </div>
      </div>
    </section>
  );
}
