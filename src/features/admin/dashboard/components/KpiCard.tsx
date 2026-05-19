import clsx from 'clsx';
import Skeleton from '@components/skeleton/Skeleton';
import styles from './KpiCard.module.css';

type KpiVariant = 'default' | 'warning' | 'success' | 'danger';

interface KpiCardProps {
  label: string;
  value?: number | string;
  loading?: boolean;
  variant?: KpiVariant;
}

function formatValue(value: number | string): string {
  if (typeof value === 'number') return value.toLocaleString('fa-IR');
  return value;
}

export default function KpiCard({
  label,
  value,
  loading = false,
  variant = 'default',
}: KpiCardProps) {
  return (
    <article className={clsx(styles.card, styles[variant])}>
      <span className={styles.label}>{label}</span>
      {loading ? (
        <Skeleton height="2rem" width="60%" className={styles.skeleton} />
      ) : (
        <span className={styles.value}>{value != null ? formatValue(value) : '—'}</span>
      )}
    </article>
  );
}
