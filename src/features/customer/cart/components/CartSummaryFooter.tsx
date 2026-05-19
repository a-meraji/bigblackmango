import type { Cart } from '@types/cart';
import { formatPrice } from '@utils/format-price';
import Button from '@components/button/Button';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@store/cart.store';
import styles from './CartSummaryFooter.module.css';

interface Props {
  cart: Cart;
}

export default function CartSummaryFooter({ cart }: Props) {
  const navigate = useNavigate();
  const closeCart = useCartStore((s) => s.closeCart);
  const hasUnavailable = useCartStore((s) => s.hasUnavailableItems());

  function goToCheckout() {
    if (hasUnavailable) return;
    closeCart();
    navigate('/checkout');
  }

  return (
    <div className={styles.footer}>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span>جمع خرید</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>هزینه ارسال</span>
          <span className={styles.deliveryFee}>{formatPrice(cart.deliveryFee)}</span>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <span>مبلغ قابل پرداخت</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </div>
      {hasUnavailable && (
        <p className={styles.checkoutHint} role="status">
          برای ادامه، غذاهای ناموجود را از سبد حذف کنید.
        </p>
      )}
      <Button fullWidth onClick={goToCheckout} disabled={hasUnavailable}>
        ادامه و تکمیل سفارش
      </Button>
    </div>
  );
}
