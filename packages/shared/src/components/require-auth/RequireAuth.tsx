import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import Spinner from '@components/spinner/Spinner';
import styles from './RequireAuth.module.css';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, reauthOpen } = useAuthStore();
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

  return <>{children}</>;
}
