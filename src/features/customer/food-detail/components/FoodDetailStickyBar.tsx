import type { PublicFoodDetail } from '@t/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import { formatPrice } from '@utils/format-price';
import StickyFooter from '@components/sticky-footer/StickyFooter';
import { useAddToCart } from '@features/customer/cart/hooks/useAddToCart';
import styles from './FoodDetailStickyBar.module.css';

interface Props {
  food: PublicFoodDetail;
  availability: NormalizedAvailability | null;
}

export default function FoodDetailStickyBar({ food, availability }: Props) {
  const { addToCart, addingId } = useAddToCart();
  const isOutOfStock = !availability || !availability.isAvailable;
  const isLoading = availability ? addingId === availability.menuItemId : false;

  return (
    <StickyFooter className={styles.bar}>
      <div className={styles.pill}>
        <span className={styles.price}>{formatPrice(food.price)}</span>
        {availability && (
          <button
            className={styles.cta}
            disabled={isOutOfStock || isLoading}
            aria-busy={isLoading || undefined}
            onClick={() =>
              addToCart({
                menuItemId: availability.menuItemId,
                unitPrice: food.price,
                food: {
                  id: food.id,
                  name: food.name,
                  thumbnailUrl: food.imageUrl,
                },
              })
            }
          >
            {isLoading && <span className={styles.spinner} aria-hidden="true" />}
            <span className={isLoading ? styles.hiddenText : undefined}>افزودن به سبد</span>
          </button>
        )}
      </div>
    </StickyFooter>
  );
}
