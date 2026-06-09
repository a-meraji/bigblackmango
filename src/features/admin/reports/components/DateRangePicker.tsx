import clsx from 'clsx';
import { JalaliDatePicker } from '@components/jalali-date-picker';
import { isoToGregorianDate } from '@utils/locale';
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
  return isoToGregorianDate(d.toISOString());
}

function getActiveDays(dateFrom: string, dateTo: string): number | null {
  if (!dateFrom || !dateTo) return null;
  const from = new Date(dateFrom + 'T12:00:00');
  const to = new Date(dateTo + 'T12:00:00');
  const today = toIsoDate(new Date());
  if (dateTo !== today) return null;
  const diff = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function DateRangePicker({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  const activeDays = getActiveDays(dateFrom, dateTo);

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
            className={clsx(styles.quickBtn, activeDays === r.days && styles.quickActive)}
            aria-pressed={activeDays === r.days}
            onClick={() => applyQuickRange(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className={styles.inputs}>
        <JalaliDatePicker value={dateFrom} onChange={onFromChange} label="از تاریخ" compact />
        <span className={styles.sep}>تا</span>
        <JalaliDatePicker value={dateTo} onChange={onToChange} label="تا تاریخ" compact />
      </div>
    </div>
  );
}
