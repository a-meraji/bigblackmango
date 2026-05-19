import type { Category } from '@types/food';
import styles from './CategoryFilter.module.css';

interface CategoryFilterProps {
  categories: Category[];
  activeId: string | undefined;
  onSelect: (id: string | undefined) => void;
  loading: boolean;
}

export default function CategoryFilter({
  categories,
  activeId,
  onSelect,
  loading,
}: CategoryFilterProps) {
  if (loading) {
    return (
      <div className={styles.row} aria-busy="true">
        {[72, 64, 80, 56, 68].map((w, i) => (
          <div key={i} className={styles.skeleton} style={{ inlineSize: `${w}px` }} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.row} role="group" aria-label="فیلتر دسته‌بندی">
      <button
        className={`${styles.chip} ${!activeId ? styles.active : ''}`}
        onClick={() => onSelect(undefined)}
        aria-pressed={!activeId}
        type="button"
      >
        همه
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.chip} ${activeId === cat.id ? styles.active : ''}`}
          onClick={() => onSelect(cat.id)}
          aria-pressed={activeId === cat.id}
          type="button"
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
