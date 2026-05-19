import { useToastStore } from '@store/toast.store';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-label="اعلان‌ها">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} role="status">
          <span className={styles.message}>{t.message}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => remove(t.id)}
            aria-label="بستن"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
