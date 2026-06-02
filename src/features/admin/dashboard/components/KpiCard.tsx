import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '@components/skeleton/Skeleton';
import Icon from '@components/icon/Icon';
import styles from './KpiCard.module.css';

type KpiVariant = 'default' | 'warning' | 'success' | 'danger';

interface KpiCardProps {
  label: string;
  value?: number | string;
  loading?: boolean;
  variant?: KpiVariant;
  href?: string;
}

function formatValue(value: number | string): string {
  if (typeof value === 'number') return value.toLocaleString('fa-IR');
  return value;
}

function KpiCardBody({
  label,
  value,
  loading,
  variant,
  linked,
}: {
  label: string;
  value?: number | string;
  loading: boolean;
  variant: KpiVariant;
  linked: boolean;
}) {
  return (
    <article className={clsx(styles.card, styles[variant], linked && styles.linked)}>
      <span className={styles.label}>{label}</span>
      {loading ? (
        <Skeleton height="2rem" width="60%" className={styles.skeleton} />
      ) : (
        <span className={styles.value}>{value != null ? formatValue(value) : '—'}</span>
      )}
      {linked && <Icon icon={ChevronLeft} size="sm" className={styles.arrow} decorative />}
    </article>
  );
}

export default function KpiCard({
  label,
  value,
  loading = false,
  variant = 'default',
  href,
}: KpiCardProps) {
  if (href) {
    return (
      <Link to={href} className={styles.linkWrapper}>
        <KpiCardBody label={label} value={value} loading={loading} variant={variant} linked />
      </Link>
    );
  }
  return <KpiCardBody label={label} value={value} loading={loading} variant={variant} linked={false} />;
}
