import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@features/admin/dashboard/components/AdminSidebar';
import AdminTopBar from '@features/admin/dashboard/components/AdminTopBar';
import { ErrorBoundary } from '@components/error-boundary/ErrorBoundary';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className={styles.shell}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <AdminTopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main id="main-content" className={styles.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
