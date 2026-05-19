import { Link } from 'react-router-dom';
import type { PublicFoodSummary } from '@types/food';
import { formatPrice } from '@utils/format-price';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './RelatedFoods.module.css';

interface Props {
  foods: PublicFoodSummary[];
}

export default function RelatedFoods({ foods }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>غذاهای مشابه</h2>
      <div className={styles.row}>
        {foods.map((food) => (
          <Link key={food.id} to={`/foods/${food.id}`} className={styles.card}>
            {food.imageUrl && (
              <img
                src={resolveMediaUrl(food.imageUrl)}
                alt={food.name}
                className={styles.image}
                loading="lazy"
              />
            )}
            <span className={styles.name}>{food.name}</span>
            <span className={styles.price}>{formatPrice(food.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
