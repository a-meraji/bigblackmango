import styles from './DateRangePicker.module.css';

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

const QUICK_RANGES = [
  { label: '۷ روز', days: 7 },
  { label: '۳۰ روز', days: 30 },
  { label: '۹۰ روز', days: 90 },
];

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DateRangePicker({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  function applyQuickRange(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onFromChange(toIsoDate(from));
    onToChange(toIsoDate(to));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.quick}>
        {QUICK_RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            className={styles.quickBtn}
            onClick={() => applyQuickRange(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className={styles.inputs}>
        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={(e) => onFromChange(e.target.value)}
          aria-label="از تاریخ"
        />
        <span className={styles.sep}>تا</span>
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={(e) => onToChange(e.target.value)}
          aria-label="تا تاریخ"
        />
      </div>
    </div>
  );
}
