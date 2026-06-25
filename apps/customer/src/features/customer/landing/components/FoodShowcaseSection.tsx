import type { PublicFoodSummary } from '@t/food';
import type { LandingFoodShowcase } from '@t/landing';
import { formatPrice } from '@utils/format-price';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import DepthCarousel from './DepthCarousel';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './FoodShowcaseSection.module.css';

interface Props {
  config: LandingFoodShowcase;
  foods: PublicFoodSummary[];
  loading?: boolean;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
  installing?: boolean;
}

function FoodCarouselCard({
  food,
  isActive,
  onInstallClick,
}: {
  food: PublicFoodSummary;
  isActive: boolean;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
}) {
  return (
    <button
      type="button"
      className={`${styles.tile} ${isActive ? styles.tileActive : styles.tileInactive}`}
      onClick={() => onInstallClick('food_showcase')}
      tabIndex={isActive ? 0 : -1}
      aria-label={`${food.name}، ${formatPrice(food.price)} — نصب اپ برای سفارش`}
    >
      <span className={styles.imageWrap}>
        {food.imageUrl ? (
          <img
            src={resolveMediaUrl(food.imageUrl)}
            alt=""
            className={styles.image}
            loading={isActive ? 'eager' : 'lazy'}
          />
        ) : (
          <span className={styles.imagePlaceholder} aria-hidden="true" />
        )}
        <span className={styles.gradient} aria-hidden="true" />
        <span className={styles.name}>{food.name}</span>
      </span>
    </button>
  );
}

export default function FoodShowcaseSection({
  config,
  foods,
  loading = false,
  onInstallClick,
}: Props) {
  if (!loading && foods.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="food-showcase-title">
      <div className={styles.header}>
        <LandingSectionHeader
          id="food-showcase-title"
          title={config.sectionTitle}
          iconName={config.sectionIcon}
        />
        <p className={styles.lead}>{config.lead}</p>
      </div>

      {loading ? (
        <div className={styles.carouselSkeleton} aria-hidden="true" />
      ) : (
        <DepthCarousel
          className={styles.carousel}
          items={foods}
          getItemKey={(food) => food.id}
          ariaLabel="غذاهای منتخب"
          renderSlide={(food, { isActive }) => (
            <FoodCarouselCard
              food={food}
              isActive={isActive}
              onInstallClick={onInstallClick}
            />
          )}
        />
      )}

      <div className={styles.cta} />
    </section>
  );
}
