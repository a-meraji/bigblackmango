import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { AdminDailyMenuItem } from '@types/admin-catalog';
import { formatPrice } from '@utils/format-price';
import styles from './MenuItemRow.module.css';

interface MenuItemRowProps {
  item: AdminDailyMenuItem;
  onStockChange: (stock: number) => void;
  onStoryToggle: (value: boolean) => void;
  onRemove: () => void;
}

function stockTone(stock: number): string | undefined {
  if (stock === 0) return styles.stockDanger;
  if (stock <= 3) return styles.stockWarning;
  return undefined;
}

export default function MenuItemRow({
  item,
  onStockChange,
  onStoryToggle,
  onRemove,
}: MenuItemRowProps) {
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

  return (
    <li className={styles.row}>
      <div className={styles.main}>
        <span className={styles.name}>{item.food.name}</span>
        <span className={styles.meta}>{item.food.category.name}</span>
        <span className={styles.price} dir="ltr">
          {formatPrice(item.food.price)}
        </span>
      </div>

      <div className={styles.stockWrapper}>
        <label className={styles.stockLabel} htmlFor={`stock-${item.id}`}>
          موجودی
        </label>
        <input
          id={`stock-${item.id}`}
          type="number"
          min={0}
          className={clsx(styles.stockInput, stockTone(item.stock))}
          value={stockInput}
          onChange={(e) => setStockInput(e.target.value)}
          onBlur={handleStockBlur}
          dir="ltr"
          aria-describedby={item.stock <= 3 ? `stock-hint-${item.id}` : undefined}
        />
        {item.stock <= 3 && (
          <span
            id={`stock-hint-${item.id}`}
            className={clsx(
              styles.stockHint,
              item.stock === 0 ? styles.stockDanger : styles.stockWarning,
            )}
          >
            {item.stock === 0 ? 'ناموجود' : 'کم موجود'}
          </span>
        )}
      </div>

      <label className={styles.storyToggle}>
        <input
          type="checkbox"
          checked={item.isFeaturedInStory}
          onChange={(e) => onStoryToggle(e.target.checked)}
        />
        استوری
      </label>

      <button
        type="button"
        className={styles.removeBtn}
        onClick={onRemove}
        aria-label={`حذف ${item.food.name} از منو`}
      >
        حذف
      </button>
    </li>
  );
}
