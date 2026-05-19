import styles from './MetricSelector.module.css';

interface CompareLimitSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const LIMITS = [5, 10, 15, 20];

export default function CompareLimitSelector({ value, onChange }: CompareLimitSelectorProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>تعداد غذا</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="تعداد غذاهای برتر"
      >
        {LIMITS.map((n) => (
          <option key={n} value={n}>
            {n.toLocaleString('fa-IR')} مورد
          </option>
        ))}
      </select>
    </label>
  );
}
