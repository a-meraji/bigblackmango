import { Link } from 'react-router-dom';
import type { DailyMenuItem } from '@types/food';
import { formatPrice } from '@utils/format-price';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import StarRating from '@components/star-rating/StarRating';
import Badge from '@components/badge/Badge';
import Button from '@components/button/Button';
import styles from './FoodCard.module.css';

import type { GuestCartItemInput } from '@features/customer/cart/guest-cart.types';

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

  return (
    <article
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}
      aria-label={`${food.name}، ${formatPrice(food.price)}`}
    >
      <Link to={`/foods/${food.id}`} className={styles.imageLink}>
        {food.imageUrl ? (
          <img
            src={resolveMediaUrl(food.imageUrl)}
            alt={food.name}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <Link to={`/foods/${food.id}`} className={styles.nameLink}>
            <h3 className={styles.name}>{food.name}</h3>
          </Link>
          <div className={styles.badges}>
            {isOutOfStock && <Badge variant="neutral">تمام شد</Badge>}
            {isLowStock && <Badge variant="gold">فقط {stock.toLocaleString('fa-IR')} عدد</Badge>}
          </div>
        </div>

        {food.shortDescription && <p className={styles.description}>{food.shortDescription}</p>}

        {food.tags.length > 0 && (
          <div className={styles.tags}>
            {food.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.meta}>
            <StarRating average={food.rating.average} count={food.rating.count} size="sm" />
            <span className={styles.price}>{formatPrice(food.price)}</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            disabled={isOutOfStock}
            loading={isAdding}
            onClick={() =>
              onAddToCart({
                menuItemId,
                unitPrice: food.price,
                food: {
                  id: food.id,
                  name: food.name,
                  thumbnailUrl: food.imageUrl,
                },
              })
            }
            aria-label={`افزودن ${food.name} به سبد خرید`}
          >
            افزودن
          </Button>
        </div>
      </div>
    </article>
  );
}
