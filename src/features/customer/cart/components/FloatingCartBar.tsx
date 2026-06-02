import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@store/cart.store';
import { formatPrice } from '@utils/format-price';
import Icon from '@components/icon/Icon';
import { isFloatingCartBarHidden } from '@features/customer/cart/cart-bar-visibility';
import styles from './FloatingCartBar.module.css';

/**
 * Visible to all users — guest cart is stored locally; signed-in users use the server cart.
 */
export default function FloatingCartBar() {
  const { pathname } = useLocation();
  const { itemCount, total, openCart, closeCart, dismissedFloatingBar, dismissFloatingBar } = useCartStore();
  const hidden = isFloatingCartBarHidden(pathname);

  useEffect(() => {
    if (hidden) closeCart();
  }, [hidden, closeCart]);

  if (hidden || itemCount === 0 || dismissedFloatingBar) return null;

  return (
    <div className={styles.bar} role="complementary" aria-label="خلاصه سبد خرید">
      <button
        type="button"
        className={styles.dismiss}
        aria-label="بستن"
        title="بستن"
        onClick={() => {
          // Temporarily dismiss the floating bar until cart changes
          dismissFloatingBar();
        }}
      >
        <Icon icon={X} size="sm" decorative />
      </button>
      <button type="button" className={styles.btn} onClick={openCart} aria-label="مشاهده سبد خرید">
        <span className={styles.leading}>
          <Icon icon={ShoppingCart} size="sm" decorative />
          <span className={styles.count}>{itemCount.toLocaleString('fa-IR')} مورد</span>
        </span>
        <span className={styles.label}>مشاهده سبد</span>
        <span
          className={styles.total}
          aria-live="polite"
          aria-atomic="true"
          title={formatPrice(total)}
        >
          {formatPrice(total)}
        </span>
      </button>
    </div>
  );
}
