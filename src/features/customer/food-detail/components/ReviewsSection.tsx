import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFoodReviews } from '@api/foods';
import type { PublicReview } from '@types/review';
import StarRating from '@components/star-rating/StarRating';
import { toJalali } from '@utils/format-date';
import styles from './ReviewsSection.module.css';

interface Props {
  foodId: string;
  summary: { average: number; count: number };
  initialItems: PublicReview[];
}

export default function ReviewsSection({ foodId, summary, initialItems }: Props) {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<PublicReview[]>(initialItems);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: summary.count });

  useEffect(() => {
    setReviews(initialItems);
    setMeta({ page: 1, limit: 10, total: summary.count });
    setPage(1);
  }, [foodId, initialItems, summary.count]);

  const { data, isFetching } = useQuery({
    queryKey: ['food-reviews', foodId, page],
    queryFn: () => getFoodReviews(foodId, { page, limit: 10 }),
    enabled: page > 1,
  });

  useEffect(() => {
    if (data && page > 1) {
      setReviews((prev) => [...prev, ...data.items]);
      setMeta(data.meta);
    }
  }, [data, page]);

  const hasMore = meta.page * meta.limit < meta.total;

  if (summary.count === 0) {
    return (
      <section className={styles.section} aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className={styles.title}>
          نظرات کاربران
        </h2>
        <p className={styles.empty}>هنوز نظری ثبت نشده است.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>نظرات کاربران</h2>
        <StarRating average={summary.average} count={summary.count} />
      </div>

      <ul className={styles.list}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <StarRating average={review.rating} size="sm" />
              <span className={styles.date}>{toJalali(review.createdAt)}</span>
            </div>
            {review.comment && <p className={styles.comment}>{review.comment}</p>}
            {review.adminReply && (
              <div className={styles.adminReply}>
                <span className={styles.replyLabel}>پاسخ فروشگاه:</span>
                <p>{review.adminReply.message}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          className={styles.loadMore}
          disabled={isFetching}
          onClick={() => setPage((p) => p + 1)}
        >
          {isFetching ? 'در حال بارگذاری...' : 'بارگذاری بیشتر'}
        </button>
      )}
    </section>
  );
}
