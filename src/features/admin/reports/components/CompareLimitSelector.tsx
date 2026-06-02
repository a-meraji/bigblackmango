import CustomSelect from '@components/custom-select/CustomSelect';
import styles from './MetricSelector.module.css';

interface CompareLimitSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const LIMITS = [5, 10, 15, 20];

export default function CompareLimitSelector({ value, onChange }: CompareLimitSelectorProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>تعداد غذا</span>
      <CustomSelect
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        aria-label="تعداد غذاهای برتر"
        size="sm"
        options={LIMITS.map((n) => ({ value: String(n), label: `${n.toLocaleString('fa-IR')} مورد` }))}
      />
    </div>
  );
}
