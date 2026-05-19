import { Link } from 'react-router-dom';
import { ShoppingCart, ClipboardList, LogIn } from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import Icon from '@components/icon/Icon';
import styles from './TopNav.module.css';

export default function TopNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { itemCount, openCart } = useCartStore();

  return (
    <header className={styles.nav} role="banner">
   
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="بیگ بلک منگو — صفحه اصلی">
          بیگ بلک منگو
        </Link>
        <nav className={styles.actions} aria-label="ناوبری کاربر">
          <button
            type="button"
            className={styles.iconAction}
            onClick={openCart}
            aria-label={
              itemCount > 0
                ? `سبد خرید، ${itemCount.toLocaleString('fa-IR')} مورد`
                : 'سبد خرید'
            }
          >
            <Icon icon={ShoppingCart} size="md" decorative />
            {itemCount > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {itemCount > 99 ? '۹۹+' : itemCount.toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <Link to="/orders" className={styles.textLink}>
              <Icon icon={ClipboardList} size="sm" decorative />
              <span>سفارش‌ها</span>
            </Link>
          ) : (
            <Link to="/auth/otp" className={styles.textLink}>
              <Icon icon={LogIn} size="sm" decorative />
              <span>ورود</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
