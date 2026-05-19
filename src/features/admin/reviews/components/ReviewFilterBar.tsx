import { useQuery } from '@tanstack/react-query';
import { adminGetFoods } from '@api/admin/foods';
import type { AdminReviewFilters } from '@api/admin/reviews';
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
      <select
        className={styles.select}
        value={filters.foodId ?? ''}
        onChange={(e) => update({ foodId: e.target.value || undefined })}
        aria-label="فیلتر غذا"
      >
        <option value="">همه غذاها</option>
        {foods.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.rating ?? ''}
        onChange={(e) =>
          update({ rating: e.target.value ? Number(e.target.value) : undefined })
        }
        aria-label="فیلتر امتیاز"
      >
        <option value="">همه امتیازها</option>
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>
            {r.toLocaleString('fa-IR')} ستاره
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.isVisible === undefined ? '' : String(filters.isVisible)}
        onChange={(e) =>
          update({
            isVisible: e.target.value === '' ? undefined : e.target.value === 'true',
          })
        }
        aria-label="فیلتر نمایش"
      >
        <option value="">همه (نمایان + پنهان)</option>
        <option value="true">فقط نمایان</option>
        <option value="false">فقط پنهان</option>
      </select>

      <select
        className={styles.select}
        value={filters.hasAdminReply === undefined ? '' : String(filters.hasAdminReply)}
        onChange={(e) =>
          update({
            hasAdminReply: e.target.value === '' ? undefined : e.target.value === 'true',
          })
        }
        aria-label="فیلتر پاسخ مدیر"
      >
        <option value="">همه (با/بدون پاسخ)</option>
        <option value="true">دارای پاسخ مدیر</option>
        <option value="false">بدون پاسخ</option>
      </select>
    </div>
  );
}
