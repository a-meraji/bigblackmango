import Skeleton from '@components/skeleton/Skeleton';
import styles from './SectionSkeleton.module.css';

export default function SectionSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton height={24} width="40%" borderRadius="var(--radius-sm)" />
      <Skeleton height={220} borderRadius="var(--radius-lg)" />
    </div>
  );
}
