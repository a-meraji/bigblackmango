import { Loader2, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DailyMenuItem } from '@t/food';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import type { GuestCartItemInput } from '@features/customer/cart/guest-cart.types';
import styles from './FoodCard.module.css';
import { formatNumber } from '@utils/locale';

interface FoodCardProps {
  item: DailyMenuItem;
  onAddToCart: (input: GuestCartItemInput) => void;
  addingId: string | null;
}

const LOW_STOCK_THRESHOLD = 5;

export default function FoodCard({ item, onAddToCart, addingId }: FoodCardProps) {
  const { food, stock, menuItemId } = item;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const isAdding = addingId === menuItemId;
  const salePrice = item.salePrice ?? food.price;
  const hasMenuDiscount =
    item.discountPercent != null && item.discountPercent > 0 && salePrice < food.price;

  return (
    <article
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}
      aria-label={`${food.name}، ${hasMenuDiscount ? 'با تخفیف' : ''}`}
    >
      <Link to={`/foods/${food.id}`} className={styles.imageWrap} tabIndex={-1} aria-hidden>
        {food.imageUrl ? (
          <img
            src={resolveMediaUrl(food.imageUrl)}
            alt={food.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        {hasMenuDiscount && (
          <span className={styles.discountBadge} dir="ltr">
            −{formatNumber(item.discountPercent!)}٪
          </span>
        )}
      </Link>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <Link to={`/foods/${food.id}`} className={styles.nameLink}>
            <h3 className={styles.name}>{food.name}</h3>
          </Link>
          <div className={styles.rating} aria-label={`امتیاز ${food.rating.average.toFixed(1)}`}>
            <Star className={styles.starIcon} size={13} fill="currentColor" strokeWidth={0} />
            <span className={styles.ratingNum}>{food.rating.average.toFixed(1)}</span>
          </div>
        </div>

        {food.shortDescription && (
          <p className={styles.description}>{food.shortDescription}</p>
        )}

        <div className={styles.bottomRow}>
          <div className={styles.priceBlock}>
            {isOutOfStock && <span className={styles.stockLabel}>تمام شد</span>}
            {isLowStock && (
              <span className={styles.stockLabel}>
                فقط {formatNumber(stock)} عدد
              </span>
            )}
            <PriceWithDiscount
              originalPrice={food.price}
              salePrice={salePrice}
              discountPercent={item.discountPercent}
              size="sm"
              showBadge={false}
            />
          </div>

          <button
            type="button"
            className={styles.addBtn}
            disabled={isOutOfStock || isAdding}
            onClick={() =>
              onAddToCart({
                menuItemId,
                unitPrice: salePrice,
                originalUnitPrice: hasMenuDiscount ? food.price : undefined,
                menuDiscountPercent: hasMenuDiscount ? item.discountPercent : undefined,
                food: { id: food.id, name: food.name, thumbnailUrl: food.imageUrl },
              })
            }
            aria-label={`افزودن ${food.name} به سبد خرید`}
          >
            {isAdding ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <Plus size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
