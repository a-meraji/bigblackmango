import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, LogIn } from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import Icon from '@components/icon/Icon';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <nav className={styles.nav} aria-label="ناوبری اصلی">
      <NavLink
        to="/"
        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        end
      >
        <Icon icon={Home} size="sm" decorative />
        <span>خانه</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/orders' : '/auth/otp'}
        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
      >
        <Icon icon={isAuthenticated ? ClipboardList : LogIn} size="sm" decorative />
        <span>{isAuthenticated ? 'سفارش‌ها' : 'ورود'}</span>
      </NavLink>
    </nav>
  );
}
