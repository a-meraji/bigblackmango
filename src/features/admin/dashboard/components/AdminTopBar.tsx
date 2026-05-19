import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import IconButton from '@components/icon-button/IconButton';
import { getAdminPageTitle } from '@features/admin/dashboard/admin-nav';
import styles from './AdminTopBar.module.css';

interface AdminTopBarProps {
  onMenuToggle: () => void;
}

export default function AdminTopBar({ onMenuToggle }: AdminTopBarProps) {
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  const title = getAdminPageTitle(pathname);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.mobile || 'مدیر';

  return (
    <header className={styles.bar}>
      <IconButton
        icon={Menu}
        label="باز کردن منو"
        className={styles.menuBtn}
        onClick={onMenuToggle}
      />
      <h1 className={styles.title}>{title}</h1>
      <span className={styles.user} title={user?.mobile}>
        {displayName}
      </span>
    </header>
  );
}
