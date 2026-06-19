import { Construction } from 'lucide-react';
import EmptyState from '@components/empty-state/EmptyState';
import { useLocation } from 'react-router-dom';
import { getAdminPageTitle } from '@features/admin/dashboard/admin-nav';
import styles from './AdminPlaceholderPage.module.css';

export default function AdminPlaceholderPage() {
  const { pathname } = useLocation();
  const title = getAdminPageTitle(pathname);

  return (
    <div className={styles.wrap}>
      <EmptyState
        icon={Construction}
        title={title}
        description="این بخش در فازهای بعدی پیاده‌سازی می‌شود."
      />
    </div>
  );
}
