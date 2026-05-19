import { UtensilsCrossed } from 'lucide-react';
import { useMenuToday } from '@features/customer/home/hooks/useMenuToday';
import { useAddToCart } from '@features/customer/cart/hooks/useAddToCart';
import EmptyState from '@components/empty-state/EmptyState';
import Skeleton from '@components/skeleton/Skeleton';
import FoodCard from './FoodCard';
import styles from './FoodGrid.module.css';

interface FoodGridProps {
  categoryId?: string;
}

export default function FoodGrid({ categoryId }: FoodGridProps) {
  const { data, isLoading, isError } = useMenuToday(categoryId);
  const { addToCart, addingId } = useAddToCart();

  if (isLoading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="در حال بارگذاری منو">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={styles.skeleton} borderRadius="var(--radius-lg)" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="خطا در بارگذاری منو"
        description="لطفاً اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
        actionLabel="بارگذاری مجدد"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!data?.items.length) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="منویی برای امروز وجود ندارد"
        description="فردا دوباره سر بزنید یا دسته دیگری را انتخاب کنید."
      />
    );
  }

  return (
    <div className={styles.grid}>
      {data.items.map((item) => (
        <FoodCard key={item.menuItemId} item={item} onAddToCart={addToCart} addingId={addingId} />
      ))}
    </div>
  );
}
