import { useEffect, useState } from 'react';
import type { AdminOrderFilters } from '@api/admin/orders';
import type { OrderStatus } from '@t/order';
import { ORDER_STATUS_LABELS } from '@utils/order-status';
import CustomSelect from '@components/custom-select/CustomSelect';
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

      <CustomSelect
        value={filters.status ?? ''}
        onChange={(v) => update({ status: (v as OrderStatus) || undefined })}
        placeholder="همه وضعیت‌ها"
        aria-label="فیلتر وضعیت"
        size="sm"
        className={styles.filterSelect}
        options={[
          { value: '', label: 'همه وضعیت‌ها' },
          ...ALL_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
        ]}
      />

      <CustomSelect
        value={filters.paymentStatus ?? ''}
        onChange={(v) => update({ paymentStatus: (v as 'paid' | 'unpaid') || undefined })}
        placeholder="همه پرداخت‌ها"
        aria-label="فیلتر پرداخت"
        size="sm"
        className={styles.filterSelect}
        options={[
          { value: '', label: 'همه پرداخت‌ها' },
          { value: 'paid', label: 'پرداخت‌شده' },
          { value: 'unpaid', label: 'پرداخت‌نشده' },
        ]}
      />

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
