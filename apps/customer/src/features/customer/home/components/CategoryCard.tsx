import type { Category } from '@t/food';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  category: Category;
  onSelect: (id: string) => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const imgSrc = resolveMediaUrl(category.imageUrl);

  return (
    <article className={styles.card} aria-label={category.name}>
      <button
        type="button"
        className={styles.inner}
        onClick={() => onSelect(category.id)}
        aria-label={`مشاهده منوی ${category.name}`}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            aria-hidden="true"
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true" />
        )}
        <div className={styles.overlay} aria-hidden="true" />
        <span className={styles.title}>{category.name}</span>
      </button>
    </article>
  );
}
