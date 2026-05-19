import type { ChartMetric, ChartType } from '@api/admin/reports';
import styles from './MetricSelector.module.css';

const METRICS: Array<{ value: ChartMetric; label: string }> = [
  { value: 'total_sales', label: 'مبلغ فروش' },
  { value: 'quantity', label: 'تعداد' },
  { value: 'sales_amount', label: 'درآمد' },
];

interface MetricSelectorProps {
  value: ChartMetric;
  onChange: (value: ChartMetric) => void;
  chartType: ChartType;
}

export default function MetricSelector({ value, onChange, chartType }: MetricSelectorProps) {
  if (chartType === 'category_share') return null;

  const available =
    chartType === 'total_trend'
      ? METRICS.filter((m) => m.value !== 'sales_amount')
      : METRICS;

  return (
    <label className={styles.field}>
      <span className={styles.label}>معیار</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as ChartMetric)}
        aria-label="معیار نمودار"
      >
        {available.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );
}
