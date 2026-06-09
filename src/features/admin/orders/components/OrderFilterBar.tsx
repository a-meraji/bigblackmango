import { useEffect, useState } from 'react';
import type { AdminOrderFilters } from '@api/admin/orders';
import type { OrderStatus } from '@t/order';
import { ORDER_STATUS_LABELS } from '@utils/order-status';
import CustomSelect from '@components/custom-select/CustomSelect';
import { JalaliDatePicker } from '@components/jalali-date-picker';
import { useLocalizedDigits } from '@hooks/useLocalizedDigits';
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
  const searchProps = useLocalizedDigits(searchInput, setSearchInput, { dir: 'ltr' });

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
        aria-label="جستجو"
        {...searchProps}
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

      <JalaliDatePicker
        value={filters.fromDate ?? ''}
        onChange={(v) => update({ fromDate: v || undefined })}
        compact
        className={styles.datePicker}
      />
      <span className={styles.dateSep}>تا</span>
      <JalaliDatePicker
        value={filters.toDate ?? ''}
        onChange={(v) => update({ toDate: v || undefined })}
        compact
        className={styles.datePicker}
      />

      <button type="button" className={styles.manualBtn} onClick={onManualOrder}>
        + ثبت سفارش دستی
      </button>
    </div>
  );
}
