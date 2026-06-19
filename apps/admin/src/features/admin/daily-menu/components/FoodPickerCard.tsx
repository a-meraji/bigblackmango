import clsx from 'clsx';
import { Check, Plus } from 'lucide-react';
import type { AdminFood } from '@t/admin-catalog';
import { formatPrice } from '@utils/format-price';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './FoodPickerCard.module.css';

interface FoodPickerCardProps {
  food: AdminFood;
  isSelected: boolean;
  isInMenu: boolean;
  onToggle: () => void;
}

export default function FoodPickerCard({ food, isSelected, isInMenu, onToggle }: FoodPickerCardProps) {
  const imgSrc = resolveMediaUrl(food.imageUrl);

  return (
    <button
      type="button"
      onClick={isInMenu ? undefined : onToggle}
      disabled={isInMenu}
      aria-pressed={isSelected}
      aria-label={`${food.name}${isInMenu ? ' — در منو است' : isSelected ? ' — انتخاب شده' : ''}`}
      className={clsx(
        styles.card,
        isSelected && styles.selected,
        isInMenu && styles.inMenu,
      )}
    >
      <div className={styles.imgWrapper}>
        {imgSrc ? (
          <img src={imgSrc} alt="" className={styles.img} loading="lazy" />
        ) : (
          <div className={styles.imgPlaceholder} aria-hidden="true">🍽️</div>
        )}
        <div className={styles.stateOverlay} aria-hidden="true">
          {isInMenu ? (
            <span className={styles.inMenuChip}>در منو</span>
          ) : isSelected ? (
            <span className={styles.checkCircle}>
              <Check size={16} strokeWidth={3} />
            </span>
          ) : (
            <span className={styles.addCircle}>
              <Plus size={18} strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{food.name}</span>
        <span className={styles.category}>{food.category.name}</span>
        <span className={styles.price} dir="ltr">{formatPrice(food.price)}</span>
      </div>
    </button>
  );
}
