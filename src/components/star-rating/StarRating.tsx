import styles from './StarRating.module.css';

interface StarRatingProps {
  average: number;
  count?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ average, count, size = 'md' }: StarRatingProps) {
  return (
    <div className={`${styles.wrapper} ${styles[size]}`} aria-label={`امتیاز ${average} از ۵`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            average >= star ? styles.filled : average >= star - 0.5 ? styles.half : styles.empty
          }
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      {count !== undefined && (
        <span className={styles.count}>({count.toLocaleString('fa-IR')})</span>
      )}
    </div>
  );
}
