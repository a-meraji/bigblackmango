import type { PublicFoodDetail } from '@types/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './FoodDetailHero.module.css';

interface Props {
  food: PublicFoodDetail;
  availability: NormalizedAvailability | null;
}

export default function FoodDetailHero({ food, availability }: Props) {
  return (
    <div className={styles.hero}>
      {food.imageUrl ? (
        <img
          src={resolveMediaUrl(food.imageUrl)}
          alt={food.name}
          className={styles.image}
          fetchPriority="high"
        />
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}
      {availability && !availability.isAvailable && (
        <div className={styles.soldOutOverlay} aria-label="تمام شد">
          <span>تمام شد</span>
        </div>
      )}
    </div>
  );
}
