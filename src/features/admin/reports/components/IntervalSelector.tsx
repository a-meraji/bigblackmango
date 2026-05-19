import type { ChartInterval } from '@api/admin/reports';
import styles from './MetricSelector.module.css';

const INTERVALS: Array<{ value: ChartInterval; label: string }> = [
  { value: 'day', label: 'روزانه' },
  { value: 'week', label: 'هفتگی' },
  { value: 'month', label: 'ماهانه' },
];

interface IntervalSelectorProps {
  value: ChartInterval;
  onChange: (value: ChartInterval) => void;
}

export default function IntervalSelector({ value, onChange }: IntervalSelectorProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>بازه زمانی</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as ChartInterval)}
        aria-label="بازه زمانی نمودار"
      >
        {INTERVALS.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>
    </label>
  );
}
