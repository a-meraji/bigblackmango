import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import Button from '@components/button/Button';
import styles from './RouteError.module.css';

function resolveMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return 'صفحه مورد نظر یافت نشد.';
    return error.statusText || 'خطایی در بارگذاری صفحه رخ داده است.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'صفحه مورد نظر یافت نشد یا خطایی رخ داده است.';
}

export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper} role="alert">
      <h1 className={styles.title}>خطا</h1>
      <p className={styles.message}>{resolveMessage(error)}</p>
      <Button variant="primary" onClick={() => navigate('/')}>
        بازگشت به خانه
      </Button>
    </div>
  );
}
