import clsx from 'clsx';
import type { ChartInterval } from '@api/admin/reports';
import styles from './IntervalSelector.module.css';

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
    <div className={styles.field}>
      <span className={styles.label}>بازه</span>
      <div className={styles.pills} role="group" aria-label="بازه زمانی نمودار">
        {INTERVALS.map((i) => (
          <button
            key={i.value}
            type="button"
            aria-pressed={value === i.value}
            className={clsx(styles.pill, value === i.value && styles.active)}
            onClick={() => onChange(i.value)}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}
