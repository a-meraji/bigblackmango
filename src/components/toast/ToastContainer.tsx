import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore, type ToastItem } from '@store/toast.store';
import styles from './ToastContainer.module.css';

const AUTO_DISMISS_MS = 4200;
const EXIT_MS = 320;

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);
  const Icon = ICONS[toast.type];

  const dismiss = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(() => onRemove(toast.id), EXIT_MS);
  }, [onRemove, toast.id]);

  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      className={clsx(styles.toast, styles[toast.type], exiting && styles.exit)}
      role="status"
    >
      <Icon className={styles.icon} size={18} strokeWidth={2.25} aria-hidden />
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.dismiss}
        onClick={dismiss}
        aria-label="بستن"
      >
        <X size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-label="اعلان‌ها">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}
