import type { PublicFoodSummary } from '@t/food';
import type { LandingFoodShowcase } from '@t/landing';
import { formatPrice } from '@utils/format-price';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useRevealOnScroll } from '@hooks/useRevealOnScroll';
import InstallButton from './InstallButton';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './FoodShowcaseSection.module.css';

interface Props {
  config: LandingFoodShowcase;
  foods: PublicFoodSummary[];
  loading?: boolean;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
  installing?: boolean;
}

function FoodTile({
  food,
  index,
  onInstallClick,
}: {
  food: PublicFoodSummary;
  index: number;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
}) {
  const ref = useRevealOnScroll<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={styles.item}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <button
        type="button"
        className={styles.tile}
        onClick={() => onInstallClick('food_showcase')}
        aria-label={`${food.name}، ${formatPrice(food.price)} — نصب اپ برای سفارش`}
      >
        <span className={styles.imageWrap}>
          {food.imageUrl ? (
            <img
              src={resolveMediaUrl(food.imageUrl)}
              alt=""
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <span className={styles.imagePlaceholder} aria-hidden="true" />
          )}
          <span className={styles.gradient} aria-hidden="true" />
          <span className={styles.name}>{food.name}</span>
        </span>
      </button>
    </li>
  );
}

export default function FoodShowcaseSection({
  config,
  foods,
  loading = false,
  onInstallClick,
  installing,
}: Props) {
  if (!loading && foods.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="food-showcase-title">
      <LandingSectionHeader
        id="food-showcase-title"
        title={config.sectionTitle}
        iconName={config.sectionIcon}
      />
      <p className={styles.lead}>{config.lead}</p>

      {loading ? (
        <ul className={styles.list} aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index}>
              <div className={styles.skeleton} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.list}>
          {foods.map((food, index) => (
            <FoodTile
              key={food.id}
              food={food}
              index={index}
              onInstallClick={onInstallClick}
            />
          ))}
        </ul>
      )}

      <div className={styles.cta}>
        <InstallButton
          sectionId="food_showcase"
          onClick={onInstallClick}
          loading={installing}
          fullWidth
        />
      </div>
    </section>
  );
}
