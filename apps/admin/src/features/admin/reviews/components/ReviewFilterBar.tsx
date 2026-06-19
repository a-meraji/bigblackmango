import { useQuery } from '@tanstack/react-query';
import { adminGetFoods } from '@api/admin/foods';
import type { AdminReviewFilters } from '@api/admin/reviews';
import CustomSelect from '@components/custom-select/CustomSelect';
import styles from './ReviewFilterBar.module.css';

interface ReviewFilterBarProps {
  filters: AdminReviewFilters;
  onFiltersChange: (f: AdminReviewFilters) => void;
}

export default function ReviewFilterBar({ filters, onFiltersChange }: ReviewFilterBarProps) {
  const { data: foodsData } = useQuery({
    queryKey: ['admin', 'foods', 'review-filter'],
    queryFn: () => adminGetFoods({ limit: 100, page: 1 }),
    staleTime: 60_000,
  });

  const foods = foodsData?.items ?? [];

  function update(patch: Partial<AdminReviewFilters>) {
    onFiltersChange({ ...filters, ...patch, page: 1 });
  }

  return (
    <div className={styles.bar}>
      <CustomSelect
        value={filters.foodId ?? ''}
        onChange={(v) => update({ foodId: v || undefined })}
        placeholder="همه غذاها"
        aria-label="فیلتر غذا"
        size="sm"
        className={styles.filterSelect}
        options={[
          { value: '', label: 'همه غذاها' },
          ...foods.map((f) => ({ value: f.id, label: f.name })),
        ]}
      />

      <CustomSelect
        value={filters.rating !== undefined ? String(filters.rating) : ''}
        onChange={(v) => update({ rating: v ? Number(v) : undefined })}
        placeholder="همه امتیازها"
        aria-label="فیلتر امتیاز"
        size="sm"
        className={styles.filterSelect}
        options={[
          { value: '', label: 'همه امتیازها' },
          { value: '1', label: '۱ ستاره' },
          { value: '2', label: '۲ ستاره' },
          { value: '3', label: '۳ ستاره' },
          { value: '4', label: '۴ ستاره' },
          { value: '5', label: '۵ ستاره' },
        ]}
      />

      <CustomSelect
        value={filters.isVisible === undefined ? '' : String(filters.isVisible)}
        onChange={(v) => update({ isVisible: v === '' ? undefined : v === 'true' })}
        placeholder="همه (نمایان + پنهان)"
        aria-label="فیلتر نمایش"
        size="sm"
        className={styles.filterSelect}
        options={[
          { value: '', label: 'همه (نمایان + پنهان)' },
          { value: 'true', label: 'فقط نمایان' },
          { value: 'false', label: 'فقط پنهان' },
        ]}
      />

      <CustomSelect
        value={filters.hasAdminReply === undefined ? '' : String(filters.hasAdminReply)}
        onChange={(v) => update({ hasAdminReply: v === '' ? undefined : v === 'true' })}
        placeholder="همه (با/بدون پاسخ)"
        aria-label="فیلتر پاسخ مدیر"
        size="sm"
        className={styles.filterSelect}
        options={[
          { value: '', label: 'همه (با/بدون پاسخ)' },
          { value: 'true', label: 'دارای پاسخ مدیر' },
          { value: 'false', label: 'بدون پاسخ' },
        ]}
      />
    </div>
  );
}
