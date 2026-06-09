import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import Spinner from '@components/spinner/Spinner';
import styles from './RequireAuth.module.css';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, reauthOpen } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (reauthOpen) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/otp" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
