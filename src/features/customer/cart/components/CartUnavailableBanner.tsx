import { AlertCircle } from 'lucide-react';
import Icon from '@components/icon/Icon';
import styles from './CartUnavailableBanner.module.css';

export default function CartUnavailableBanner() {
  return (
    <div className={styles.banner} role="alert">
      <Icon icon={AlertCircle} size="sm" decorative />
      <p className={styles.text}>
        برخی غذاها دیگر در منوی امروز موجود نیستند. آن‌ها را از سبد حذف کنید تا بتوانید ادامه
        دهید.
      </p>
    </div>
  );
}
