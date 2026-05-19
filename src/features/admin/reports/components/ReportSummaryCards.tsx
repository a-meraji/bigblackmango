import { formatPrice } from '@utils/format-price';
import styles from './ReportSummaryCards.module.css';

interface ReportSummaryCardsProps {
  summary: { totalOrders: number; totalSales: number };
}

export default function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  return (
    <div className={styles.cards}>
      <article className={styles.card}>
        <span className={styles.label}>تعداد سفارش</span>
        <span className={styles.value}>{summary.totalOrders.toLocaleString('fa-IR')}</span>
      </article>
      <article className={styles.card}>
        <span className={styles.label}>مجموع فروش</span>
        <span className={styles.value} dir="ltr">
          {formatPrice(summary.totalSales)}
        </span>
      </article>
    </div>
  );
}
