import type { PublicFoodDetail } from '@types/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import { formatPrice } from '@utils/format-price';
import Button from '@components/button/Button';
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

  return (
    <StickyFooter className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.price}>{formatPrice(food.price)}</span>
        {availability && (
          <Button
            variant="primary"
            size="lg"
            disabled={isOutOfStock}
            loading={addingId === availability.menuItemId}
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
            className={styles.cta}
          >
            افزودن به سبد
          </Button>
        )}
      </div>
    </StickyFooter>
  );
}
