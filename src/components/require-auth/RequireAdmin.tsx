import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import Spinner from '@components/spinner/Spinner';
import styles from './RequireAuth.module.css';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
