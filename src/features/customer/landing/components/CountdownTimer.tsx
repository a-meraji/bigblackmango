import { useCountdown } from '../hooks/useCountdown';
import styles from './CountdownTimer.module.css';

interface Props {
  expiresAt: string | null;
}

export default function CountdownTimer({ expiresAt }: Props) {
  const remaining = useCountdown(expiresAt);
  if (!remaining) return null;

  return (
    <span className={styles.timer} aria-live="polite">
      سفارش تا {remaining}
    </span>
  );
}
