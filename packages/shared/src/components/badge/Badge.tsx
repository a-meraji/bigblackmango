import clsx from 'clsx';
import styles from './Badge.module.css';

type BadgeVariant = 'brand' | 'gold' | 'sage' | 'neutral' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[variant], className)}>{children}</span>;
}
