import type { Category } from '@t/food';
import CategoryCard from './CategoryCard';
import styles from './CategoryGrid.module.css';

interface CategoryGridProps {
  categories: Category[];
  onSelect: (id: string) => void;
  loading: boolean;
}

const SKELETON_PATTERN: Array<'full' | 'half'> = ['full', 'half', 'half', 'full', 'half', 'half'];

export default function CategoryGrid({ categories, onSelect, loading }: CategoryGridProps) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="در حال بارگذاری دسته‌بندی‌ها">
        {SKELETON_PATTERN.map((w, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${w === 'full' ? styles.full : styles.half}`}
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className={styles.grid} role="group" aria-label="دسته‌بندی‌ها">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className={cat.layoutWidth === '2col' ? styles.half : styles.full}
        >
          <CategoryCard category={cat} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
