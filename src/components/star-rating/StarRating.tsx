import styles from './StarRating.module.css';
import { formatNumber } from '@utils/locale';

interface StarRatingProps {
  average: number;
  count?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ average, count, size = 'md' }: StarRatingProps) {
  const formatted = Number.isInteger(average) ? average.toString() : average.toFixed(1);
  return (
    <div className={`${styles.wrapper} ${styles[size]}`} aria-label={`امتیاز ${average} از ۵`}>
      <span className={styles.star} aria-hidden="true">★</span>
      <span className={styles.average}>{formatted}</span>
      {count !== undefined && (
        <span className={styles.count}>({formatNumber(count)})</span>
      )}
    </div>
  );
}
