import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  adminGetReviews,
  adminSetReviewVisibility,
  type AdminReviewFilters,
  type AdminReview,
} from '@api/admin/reviews';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import StarRating from '@components/star-rating/StarRating';
import Pagination from '@components/pagination/Pagination';
import ReviewFilterBar from '@features/admin/reviews/components/ReviewFilterBar';
import AdminReplyCell from '@features/admin/reviews/components/AdminReplyCell';
import { toJalali } from '@utils/format-date';
import { useToast } from '@hooks/useToast';
import styles from './ReviewsPage.module.css';
import { formatNumber, formatDigits } from '@utils/locale';

type ReviewsQueryData = { items: AdminReview[]; meta: { page: number; limit: number; total: number } };

export default function ReviewsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [filters, setFilters] = useState<AdminReviewFilters>({ page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', filters],
    queryFn: () => adminGetReviews(filters),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      adminSetReviewVisibility(id, isVisible),
    onMutate: async ({ id, isVisible }) => {
      await qc.cancelQueries({ queryKey: ['admin', 'reviews'] });
      const previous = qc.getQueryData<ReviewsQueryData>(['admin', 'reviews', filters]);
      qc.setQueryData<ReviewsQueryData>(['admin', 'reviews', filters], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((r) => (r.id === id ? { ...r, isVisible } : r)),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success('وضعیت نمایش نظر تغییر کرد.');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['admin', 'reviews', filters], context.previous);
      }
      toast.error('خطا در تغییر وضعیت.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  const reviews = data?.items ?? [];
  const lowRatingCount = reviews.filter((r) => r.rating <= 2).length;

  function rowClassName(review: AdminReview): string | undefined {
    if (review.rating <= 2) return styles.lowRatingRow;
    if (!review.isVisible) return styles.hiddenRow;
    return undefined;
  }

  const columns: Column<AdminReview>[] = [
    {
      key: 'rating',
      label: 'امتیاز',
      width: '120px',
      render: (r) => (
        <div className={clsx(r.rating <= 2 && styles.lowRating)}>
          <StarRating average={r.rating} size="sm" />
        </div>
      ),
    },
    {
      key: 'food',
      label: 'غذا',
      render: (r) => <strong>{r.foodName}</strong>,
    },
    {
      key: 'user',
      label: 'مشتری',
      render: (r) => (
        <div className={styles.customerCell}>
          <strong>{r.reviewerName?.trim() || 'کاربر'}</strong>
          <span dir="ltr" className={styles.userMobile}>
            {formatDigits(r.userMobile)}
          </span>
        </div>
      ),
    },
    {
      key: 'order',
      label: 'سفارش',
      width: '100px',
      render: (r) => (
        <span dir="ltr" className={styles.tracking}>
          {formatDigits(r.orderTrackingCode)}
        </span>
      ),
    },
    {
      key: 'comment',
      label: 'نظر',
      render: (r) => (
        <p className={styles.comment}>
          {r.comment ? r.comment : <em className={styles.noComment}>بدون متن</em>}
        </p>
      ),
    },
    {
      key: 'date',
      label: 'تاریخ',
      width: '100px',
      render: (r) => <span className={styles.date}>{toJalali(r.createdAt)}</span>,
    },
    {
      key: 'visibility',
      label: 'نمایش',
      width: '90px',
      render: (r) => (
        <button
          type="button"
          className={clsx(
            styles.visibilityBtn,
            r.isVisible ? styles.visible : styles.hidden,
          )}
          onClick={() =>
            visibilityMutation.mutate({ id: r.id, isVisible: !r.isVisible })
          }
          disabled={visibilityMutation.isPending}
          aria-label={r.isVisible ? 'پنهان کردن' : 'نمایش دادن'}
        >
          {r.isVisible ? 'نمایان' : 'پنهان'}
        </button>
      ),
    },
    {
      key: 'reply',
      label: 'پاسخ مدیر',
      render: (r) => (
        <AdminReplyCell
          review={r}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })}
        />
      ),
    },
  ];

  return (
    <div>
      <ReviewFilterBar filters={filters} onFiltersChange={setFilters} />

      {lowRatingCount > 0 && (
        <div className={styles.lowRatingAlert} role="alert">
          {formatNumber(lowRatingCount)} نظر با امتیاز پایین (۱ یا ۲ ستاره) در
          این صفحه نیاز به بررسی دارد.
        </div>
      )}

      <AdminTable
        columns={columns}
        rows={reviews}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyMessage="نظری با این فیلترها یافت نشد."
        rowClassName={rowClassName}
      />

      {data && (
        <Pagination
          page={filters.page ?? 1}
          total={data.meta.total}
          limit={filters.limit ?? 20}
          onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        />
      )}
    </div>
  );
}
