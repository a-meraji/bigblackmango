import type { PublicFoodDetail } from '@t/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import StarRating from '@components/star-rating/StarRating';
import Badge from '@components/badge/Badge';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
import styles from './FoodDetailBody.module.css';
import { formatNumber } from '@utils/locale';

interface Props {
  food: PublicFoodDetail;
  availability: NormalizedAvailability | null;
}

const LOW_STOCK_THRESHOLD = 5;

export default function FoodDetailBody({ food, availability }: Props) {
  const isOutOfStock = !availability || !availability.isAvailable;
  const isLowStock =
    availability && availability.stock > 0 && availability.stock <= LOW_STOCK_THRESHOLD;

  return (
    <section className={styles.body}>
      <div className={styles.titleRow}>
        <h1 className={styles.name}>{food.name}</h1>
        <StarRating average={food.rating.average} count={food.rating.count} />
      </div>

      {availability && (
        <div className={styles.priceBlock}>
          <PriceWithDiscount
            originalPrice={food.price}
            salePrice={availability.salePrice}
            discountPercent={availability.discountPercent}
            size="md"
          />
        </div>
      )}

      {isLowStock && availability && (
        <Badge variant="gold" className={styles.stockBadge}>
          فقط {formatNumber(availability.stock)} عدد باقی مانده
        </Badge>
      )}
      {isOutOfStock && availability && (
        <Badge variant="neutral" className={styles.stockBadge}>
          تمام شد
        </Badge>
      )}

      {food.description && <p className={styles.description}>{food.description}</p>}

      {food.tags.length > 0 && (
        <div className={styles.tags}>
          {food.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
