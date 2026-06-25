import clsx from 'clsx';
import { PackageX, ShoppingCart, Tag } from 'lucide-react';
import type { PublicFoodDetail } from '@t/food';
import type { NormalizedAvailability } from '@utils/food-availability';
import Icon from '@components/icon/Icon';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
import { useAddToCart } from '@features/customer/cart/hooks/useAddToCart';
import styles from './FoodDetailStickyBar.module.css';

interface Props {
  food: PublicFoodDetail;
  availability: NormalizedAvailability | null;
}

export default function FoodDetailStickyBar({ food, availability }: Props) {
  const { addToCart, addingId } = useAddToCart();
  const isUnavailable = !availability;
  const isSoldOut = availability != null && !availability.isAvailable;
  const canAddToCart = availability != null && availability.isAvailable;
  const isLoading = canAddToCart && addingId === availability.menuItemId;
  const salePrice = availability?.salePrice ?? food.price;
  const hasMenuDiscount =
    availability != null &&
    availability.discountPercent != null &&
    availability.discountPercent > 0 &&
    salePrice < food.price;
  const ctaLabel = isUnavailable ? 'ناموجود' : isSoldOut ? 'تمام شد' : 'افزودن به سبد';

  function handleAddToCart() {
    if (!canAddToCart) return;

    addToCart({
      menuItemId: availability.menuItemId,
      unitPrice: salePrice,
      originalUnitPrice: hasMenuDiscount ? food.price : undefined,
      menuDiscountPercent: hasMenuDiscount ? availability.discountPercent : undefined,
      food: {
        id: food.id,
        name: food.name,
        thumbnailUrl: food.imageUrl,
      },
    });
  }

  return (
    <section className={styles.bar} aria-label="قیمت و افزودن به سبد">
      <div className={styles.priceGroup}>
        <Icon icon={Tag} size="sm" className={styles.priceIcon} decorative />
        <PriceWithDiscount
          originalPrice={food.price}
          salePrice={salePrice}
          discountPercent={availability?.discountPercent}
          size="lg"
          layout="stacked"
          variant="onBrand"
          showBadge={false}
          className={styles.price}
        />
      </div>
      <button
        className={styles.cta}
        disabled={!canAddToCart || isLoading}
        aria-busy={isLoading || undefined}
        onClick={handleAddToCart}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        <span className={clsx(styles.ctaContent, isLoading && styles.hiddenText)}>
          <Icon icon={canAddToCart ? ShoppingCart : PackageX} size="sm" decorative />
          <span>{ctaLabel}</span>
        </span>
      </button>
    </section>
  );
}
