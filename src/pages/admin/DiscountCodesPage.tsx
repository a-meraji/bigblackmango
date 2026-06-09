import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  adminListDiscountCodes,
  adminDeleteDiscountCode,
} from '@api/admin/discount-codes';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import AdminToolbar from '@components/admin-toolbar/AdminToolbar';
import DiscountCodeFormModal from '@features/admin/discount-codes/components/DiscountCodeFormModal';
import type { AdminDiscountCode } from '@t/discount-code';
import { toJalaliWithTime } from '@utils/format-date';
import { formatPrice } from '@utils/format-price';
import { useToast } from '@hooks/useToast';
import shared from '@styles/admin-shared.module.css';
import styles from './DiscountCodesPage.module.css';

type Filter = 'all' | 'active' | 'expired';

const FILTER_OPTIONS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'active', label: 'فعال' },
  { id: 'expired', label: 'منقضی' },
];

function formatValue(record: AdminDiscountCode): string {
  return record.type === 'percentage' ? `${record.value}%` : formatPrice(record.value);
}

function formatUsage(record: AdminDiscountCode): string {
  const limit = record.usageLimit != null ? String(record.usageLimit) : '∞';
  return `${record.usedCount} / ${limit}`;
}

function statusOf(record: AdminDiscountCode): 'active' | 'inactive' | 'expired' {
  if (record.expiresAt && new Date(record.expiresAt) <= new Date()) return 'expired';
  if (!record.isActive) return 'inactive';
  return 'active';
}

const STATUS_LABELS = {
  active: 'فعال',
  inactive: 'غیرفعال',
  expired: 'منقضی',
} as const;

export default function DiscountCodesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminDiscountCode | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['admin', 'discount-codes', filter, search],
    queryFn: () =>
      adminListDiscountCodes({
        status: filter === 'all' ? undefined : filter,
        search: search.trim() || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteDiscountCode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'discount-codes'] });
      toast.success('کد تخفیف حذف یا غیرفعال شد.');
    },
    onError: () => toast.error('خطا در حذف کد تخفیف.'),
  });

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(record: AdminDiscountCode) {
    setEditing(record);
    setShowForm(true);
  }

  function handleDelete(record: AdminDiscountCode) {
    const action = record.usedCount > 0 ? 'غیرفعال' : 'حذف';
    if (!window.confirm(`${action} کد تخفیف «${record.code}»؟`)) return;
    deleteMutation.mutate(record.id);
  }

  const columns: Column<AdminDiscountCode>[] = [
    {
      key: 'code',
      label: 'کد',
      render: (row) => (
        <span className={styles.codeCell} dir="ltr">
          {row.code}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'نوع',
      mobileHide: true,
      render: (row) => (row.type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'),
    },
    {
      key: 'value',
      label: 'مقدار',
      render: (row) => <span dir="ltr">{formatValue(row)}</span>,
    },
    {
      key: 'usage',
      label: 'استفاده',
      mobileHide: true,
      render: (row) => <span dir="ltr">{formatUsage(row)}</span>,
    },
    {
      key: 'minOrderAmount',
      label: 'حداقل سفارش',
      mobileHide: true,
      render: (row) =>
        row.minOrderAmount != null ? (
          <span dir="ltr">{formatPrice(row.minOrderAmount)}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'expiresAt',
      label: 'انقضا',
      mobileHide: true,
      render: (row) => (row.expiresAt ? toJalaliWithTime(row.expiresAt) : '—'),
    },
    {
      key: 'status',
      label: 'وضعیت',
      render: (row) => {
        const status = statusOf(row);
        return (
          <span className={clsx(styles.statusBadge, styles[`status_${status}`])}>
            {STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'عملیات',
      mobileLabel: false,
      render: (row) => (
        <div className={shared.actions}>
          <button type="button" className={shared.editBtn} onClick={() => openEdit(row)}>
            ویرایش
          </button>
          <button
            type="button"
            className={shared.deleteBtn}
            onClick={() => handleDelete(row)}
            disabled={deleteMutation.isPending}
          >
            {row.usedCount > 0 ? 'غیرفعال' : 'حذف'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="جستجوی کد..."
        onAdd={openCreate}
        addLabel="کد جدید"
      >
        <div className={styles.filterTabs} role="tablist" aria-label="فیلتر کدهای تخفیف">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={filter === option.id}
              className={filter === option.id ? styles.filterTabActive : styles.filterTab}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={codes}
        rowKey={(row) => row.id}
        loading={isLoading}
        emptyMessage="کد تخفیفی یافت نشد."
      />

      {showForm && (
        <DiscountCodeFormModal
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
