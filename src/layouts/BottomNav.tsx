import { NavLink } from 'react-router-dom';
import { ClipboardList, ShoppingCart, UtensilsCrossed, User } from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { itemCount, openCart } = useCartStore();

  return (
    <nav className={styles.nav} aria-label="ناوبری اصلی">
      <NavLink
        to="/menu"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <UtensilsCrossed size={20} strokeWidth={1.75} aria-hidden />
        <span className={styles.label}>منو</span>
      </NavLink>

      <button
        type="button"
        className={styles.item}
        onClick={openCart}
        aria-label={
          itemCount > 0
            ? `سبد خرید — ${itemCount.toLocaleString('fa-IR')} مورد`
            : 'سبد خرید'
        }
      >
        <span className={styles.iconWrap}>
          <ShoppingCart size={20} strokeWidth={1.75} aria-hidden />
          {itemCount > 0 && (
            <span className={styles.badge} aria-hidden="true">
              {itemCount > 9 ? '۹+' : itemCount.toLocaleString('fa-IR')}
            </span>
          )}
        </span>
        <span className={styles.label}>سبد</span>
      </button>

      <NavLink
        to={isAuthenticated ? '/orders' : '/auth/otp'}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <ClipboardList size={20} strokeWidth={1.75} aria-hidden />
        <span className={styles.label}>سفارش‌ها</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/profile' : '/auth/otp'}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <User size={20} strokeWidth={1.75} aria-hidden />
        <span className={styles.label}>پروفایل</span>
      </NavLink>
    </nav>
  );
}
