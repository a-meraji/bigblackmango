import { useEffect, useState } from 'react';
import type { AdminOrderFilters } from '@api/admin/orders';
import type { OrderStatus } from '@types/order';
import { ORDER_STATUS_LABELS } from '@utils/order-status';
import styles from './OrderFilterBar.module.css';

interface OrderFilterBarProps {
  filters: AdminOrderFilters;
  onFiltersChange: (f: AdminOrderFilters) => void;
  onManualOrder: () => void;
}

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function OrderFilterBar({
  filters,
  onFiltersChange,
  onManualOrder,
}: OrderFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === (filters.search ?? '')) return;
      onFiltersChange({
        ...filters,
        search: trimmed || undefined,
        page: 1,
      });
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [searchInput]);

  function update(patch: Partial<AdminOrderFilters>) {
    onFiltersChange({ ...filters, ...patch, page: 1 });
  }

  return (
    <div className={styles.bar}>
      <input
        className={styles.search}
        placeholder="کد پیگیری، موبایل یا نام..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        aria-label="جستجو"
        dir="ltr"
      />

      <select
        className={styles.select}
        value={filters.status ?? ''}
        onChange={(e) =>
          update({ status: (e.target.value as OrderStatus) || undefined })
        }
        aria-label="فیلتر وضعیت"
      >
        <option value="">همه وضعیت‌ها</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.paymentStatus ?? ''}
        onChange={(e) =>
          update({
            paymentStatus: (e.target.value as 'paid' | 'unpaid') || undefined,
          })
        }
        aria-label="فیلتر پرداخت"
      >
        <option value="">همه پرداخت‌ها</option>
        <option value="paid">پرداخت‌شده</option>
        <option value="unpaid">پرداخت‌نشده</option>
      </select>

      <input
        type="date"
        className={styles.dateInput}
        value={filters.fromDate ?? ''}
        onChange={(e) => update({ fromDate: e.target.value || undefined })}
        aria-label="از تاریخ"
      />
      <span className={styles.dateSep}>تا</span>
      <input
        type="date"
        className={styles.dateInput}
        value={filters.toDate ?? ''}
        onChange={(e) => update({ toDate: e.target.value || undefined })}
        aria-label="تا تاریخ"
      />

      <button type="button" className={styles.manualBtn} onClick={onManualOrder}>
        + ثبت سفارش دستی
      </button>
    </div>
  );
}
