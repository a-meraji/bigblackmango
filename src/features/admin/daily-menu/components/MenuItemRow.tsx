import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Trash2, Star } from 'lucide-react';
import type { AdminDailyMenuItem } from '@t/admin-catalog';
import { formatPrice } from '@utils/format-price';
import styles from './MenuItemRow.module.css';

interface MenuItemRowProps {
  item: AdminDailyMenuItem;
  onStockChange: (stock: number) => void;
  onStoryToggle: (value: boolean) => void;
  onRemove: () => void;
}

export default function MenuItemRow({ item, onStockChange, onStoryToggle, onRemove }: MenuItemRowProps) {
  const [stockInput, setStockInput] = useState(String(item.stock));

  useEffect(() => {
    setStockInput(String(item.stock));
  }, [item.stock]);

  function handleStockBlur() {
    const n = Number(stockInput);
    if (!Number.isNaN(n) && n >= 0 && n !== item.stock) {
      onStockChange(n);
    } else {
      setStockInput(String(item.stock));
    }
  }

  const stockTone =
    item.stock === 0 ? styles.stockDanger : item.stock <= 5 ? styles.stockWarning : undefined;

  return (
    <li className={styles.row}>
      {/* Name + meta */}
      <div className={styles.info}>
        <span className={styles.name}>{item.food.name}</span>
        <span className={styles.category}>{item.food.category.name}</span>
        <span className={styles.price} dir="ltr">{formatPrice(item.food.price)}</span>
      </div>

      {/* Controls row */}
      <div className={styles.controls}>
        {/* Stock */}
        <div className={styles.stockGroup}>
          <label className={styles.stockLabel} htmlFor={`stock-${item.id}`}>
            موجودی
          </label>
          <div className={styles.stockRow}>
            <input
              id={`stock-${item.id}`}
              type="number"
              min={0}
              className={clsx(styles.stockInput, stockTone)}
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              onBlur={handleStockBlur}
              dir="ltr"
            />
            {item.stock <= 5 && (
              <span className={clsx(styles.stockBadge, stockTone)}>
                {item.stock === 0 ? 'ناموجود' : 'کم موجود'}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            title={item.isFeaturedInStory ? 'حذف از استوری' : 'افزودن به استوری'}
            aria-pressed={item.isFeaturedInStory}
            className={clsx(styles.actionBtn, item.isFeaturedInStory && styles.storyActive)}
            onClick={() => onStoryToggle(!item.isFeaturedInStory)}
          >
            <Star size={16} aria-hidden="true" />
            <span>استوری</span>
          </button>

          <button
            type="button"
            className={clsx(styles.actionBtn, styles.removeBtn)}
            onClick={onRemove}
            aria-label={`حذف ${item.food.name} از منو`}
            title="حذف از منو"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}
