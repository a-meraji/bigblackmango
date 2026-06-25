import { useParams, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import EmptyState from '@components/empty-state/EmptyState';
import { useFoodDetail } from '@features/customer/food-detail/hooks/useFoodDetail';
import FoodDetailHero from '@features/customer/food-detail/components/FoodDetailHero';
import FoodDetailBody from '@features/customer/food-detail/components/FoodDetailBody';
import FoodDetailStickyBar from '@features/customer/food-detail/components/FoodDetailStickyBar';
import ReviewsSection from '@features/customer/food-detail/components/ReviewsSection';
import RelatedFoods from '@features/customer/food-detail/components/RelatedFoods';
import FoodDetailSkeleton from '@features/customer/food-detail/components/FoodDetailSkeleton';
import { normalizeTodayAvailability } from '@utils/food-availability';
import styles from './FoodDetailPage.module.css';

export default function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useFoodDetail(foodId ?? '');

  if (isLoading) return <FoodDetailSkeleton />;

  if (isError || !data) {
    return (
      <PageShell withCartInset>
        <EmptyState
          icon={UtensilsCrossed}
          title="غذا یافت نشد"
          description="ممکن است از منوی امروز حذف شده باشد."
          actionLabel="بازگشت به منو"
          onAction={() => navigate('/')}
        />
      </PageShell>
    );
  }

  const availability = normalizeTodayAvailability(data.todayAvailability);

  return (
    <div className={styles.page}>
      <FoodDetailHero food={data.food} availability={availability} />
      <div className={styles.contentCard}>
        <FoodDetailBody food={data.food} availability={availability} />
        <FoodDetailStickyBar food={data.food} availability={availability} />
        <ReviewsSection
          summary={data.reviews.summary}
          initialItems={data.reviews.items}
          foodId={foodId!}
        />
        {data.relatedFoods.length > 0 && <RelatedFoods foods={data.relatedFoods} />}
      </div>
    </div>
  );
}
