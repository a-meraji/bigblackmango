import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@store/cart.store';
import styles from './StockConflictAlert.module.css';

interface Conflict {
  menuItemId: string;
  requestedQuantity: number;
  availableQuantity: number;
}

interface Props {
  conflicts: Conflict[];
  onDismiss: () => void;
}

export default function StockConflictAlert({ conflicts, onDismiss }: Props) {
  const navigate = useNavigate();
  const openCart = useCartStore((s) => s.openCart);

  function handleDismiss() {
    onDismiss();
    navigate('/');
    openCart();
  }

  return (
    <div className={styles.alert} role="alert">
      <p className={styles.title}>تغییر موجودی</p>
      <p className={styles.message}>
        تعداد برخی اقلام در سبد شما بیش از موجودی فعلی است. لطفاً سبد را بررسی کنید.
      </p>
      <ul className={styles.list}>
        {conflicts.map((c) => (
          <li key={c.menuItemId}>
            درخواست: {c.requestedQuantity.toLocaleString('fa-IR')} — موجود:{' '}
            {c.availableQuantity.toLocaleString('fa-IR')}
          </li>
        ))}
      </ul>
      <button type="button" className={styles.dismissBtn} onClick={handleDismiss}>
        بازگشت به سبد
      </button>
    </div>
  );
}
