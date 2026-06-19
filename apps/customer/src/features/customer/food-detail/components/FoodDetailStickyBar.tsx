import type { PublicFoodDetail } from '@t/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
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
  const salePrice = availability?.salePrice ?? food.price;
  const hasMenuDiscount =
    availability != null &&
    availability.discountPercent != null &&
    availability.discountPercent > 0 &&
    salePrice < food.price;

  return (
    <StickyFooter className={styles.bar}>
      <div className={styles.pill}>
        <PriceWithDiscount
          originalPrice={food.price}
          salePrice={salePrice}
          discountPercent={availability?.discountPercent}
          size="lg"
          layout="inline"
          className={styles.price}
        />
        {availability && (
          <button
            className={styles.cta}
            disabled={isOutOfStock || isLoading}
            aria-busy={isLoading || undefined}
            onClick={() =>
              addToCart({
                menuItemId: availability.menuItemId,
                unitPrice: salePrice,
                originalUnitPrice: hasMenuDiscount ? food.price : undefined,
                menuDiscountPercent: hasMenuDiscount
                  ? availability.discountPercent
                  : undefined,
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
