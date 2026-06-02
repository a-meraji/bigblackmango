import clsx from 'clsx';
import type { ChartType } from '@api/admin/reports';
import styles from './ChartTypeSelector.module.css';

const CHART_TYPES: Array<{ value: ChartType; label: string }> = [
  { value: 'total_trend', label: 'روند کلی فروش' },
  { value: 'food_compare', label: 'مقایسه غذاها' },
  { value: 'food_trend', label: 'روند یک غذا' },
  { value: 'category_share', label: 'سهم دسته‌بندی‌ها' },
];

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (value: ChartType) => void;
}

export default function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <>
      {/* Mobile: native dropdown */}
      <div className={styles.mobileWrap}>
        <span className={styles.mobileLabel}>نوع نمودار</span>
        <select
          className={styles.mobileSelect}
          value={value}
          onChange={(e) => onChange(e.target.value as ChartType)}
          aria-label="نوع نمودار"
        >
          {CHART_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: pill tabs */}
      <div className={styles.tabs} role="tablist" aria-label="نوع نمودار">
        {CHART_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            className={clsx(styles.tab, value === t.value && styles.active)}
            onClick={() => onChange(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </>
  );
}
