import clsx from 'clsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { logout } from '@api/auth';
import { useAuthStore } from '@store/auth.store';
import Icon from '@components/icon/Icon';
import {
  ADMIN_NAV_MANAGEMENT,
  ADMIN_NAV_OPERATIONS,
} from '@features/admin/dashboard/admin-nav';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: typeof ADMIN_NAV_OPERATIONS;
  onNavigate: () => void;
}) {
  return (
    <>
      <p className={styles.section}>{title}</p>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
          onClick={onNavigate}
        >
          <Icon icon={item.icon} size="sm" decorative />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </>
  );
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const clearUser = useAuthStore((s) => s.clearUser);

  async function handleLogout() {
    await logout();
    clearUser();
    navigate('/');
  }

  return (
    <>
      <button
        type="button"
        className={clsx(styles.overlay, isOpen && styles.overlayVisible)}
        onClick={onClose}
        aria-label="بستن منو"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        className={clsx(styles.sidebar, isOpen && styles.open)}
        aria-label="ناوبری مدیریت"
      >
        <div className={styles.header}>
          <span className={styles.brand}>پنل مدیریت</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="بستن منو">
            <Icon icon={X} size="md" decorative />
          </button>
        </div>

        <nav className={styles.nav}>
          <NavSection title="عملیات" items={ADMIN_NAV_OPERATIONS} onNavigate={onClose} />
          <NavSection title="مدیریت" items={ADMIN_NAV_MANAGEMENT} onNavigate={onClose} />
        </nav>

        <div className={styles.footer}>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <Icon icon={LogOut} size="sm" decorative />
            خروج از حساب
          </button>
        </div>
      </aside>
    </>
  );
}
