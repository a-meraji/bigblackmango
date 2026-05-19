import clsx from 'clsx';
import styles from './CheckoutSteps.module.css';

export type CheckoutStepId = 'auth' | 'delivery' | 'payment';

const ALL_STEPS: { id: CheckoutStepId; label: string }[] = [
  { id: 'auth', label: 'ورود' },
  { id: 'delivery', label: 'آدرس' },
  { id: 'payment', label: 'پرداخت' },
];

interface Props {
  current: CheckoutStepId;
  /** When true, hide the auth step (user is already signed in). */
  skipAuth?: boolean;
}

export default function CheckoutSteps({ current, skipAuth }: Props) {
  const steps = skipAuth ? ALL_STEPS.filter((s) => s.id !== 'auth') : ALL_STEPS;
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav className={styles.nav} aria-label="مراحل تسویه حساب">
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;

          return (
            <li
              key={step.id}
              className={clsx(styles.item, isActive && styles.active, isDone && styles.done)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className={styles.dot}>{(index + 1).toLocaleString('fa-IR')}</span>
              <span className={styles.label}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
