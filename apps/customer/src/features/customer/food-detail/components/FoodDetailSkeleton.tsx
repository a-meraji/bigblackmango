import styles from './FoodDetailSkeleton.module.css';

export default function FoodDetailSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="در حال بارگذاری">
      <div className={styles.hero} />
      <div className={styles.contentCard}>
        <div className={styles.lineLg} />
        <div className={styles.lineMd} />
        <div className={styles.lineFull} />
        <div className={styles.lineFull} />
        <div className={styles.lineFull} />
      </div>
    </div>
  );
}
