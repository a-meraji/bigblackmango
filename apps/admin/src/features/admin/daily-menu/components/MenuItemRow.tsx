import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Trash2, Star } from 'lucide-react';
import type { AdminDailyMenuItem } from '@t/admin-catalog';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
import { useLocalizedDigits } from '@hooks/useLocalizedDigits';
import { formatNumber } from '@utils/locale';
import styles from './MenuItemRow.module.css';

interface MenuItemRowProps {
  item: AdminDailyMenuItem;
  selected: boolean;
  onSelectToggle: (checked: boolean) => void;
  onStockChange: (stock: number) => void;
  onDiscountChange: (discountPercent: number | null) => void;
  onStoryToggle: (value: boolean) => void;
  onRemove: () => void;
}

export default function MenuItemRow({
  item,
  selected,
  onSelectToggle,
  onStockChange,
  onDiscountChange,
  onStoryToggle,
  onRemove,
}: MenuItemRowProps) {
  const [stockInput, setStockInput] = useState(String(item.stock));
  const [discountInput, setDiscountInput] = useState(
    item.discountPercent != null ? String(item.discountPercent) : '',
  );

  useEffect(() => {
    setStockInput(String(item.stock));
  }, [item.stock]);

  useEffect(() => {
    setDiscountInput(item.discountPercent != null ? String(item.discountPercent) : '');
  }, [item.discountPercent]);

  function handleStockBlur() {
    const n = Number(stockInput);
    if (!Number.isNaN(n) && n >= 0 && n !== item.stock) {
      onStockChange(n);
    } else {
      setStockInput(String(item.stock));
    }
  }

  function handleDiscountBlur() {
    const trimmed = discountInput.trim();
    if (!trimmed) {
      if (item.discountPercent != null) {
        onDiscountChange(null);
      }
      return;
    }

    const n = Number(trimmed);
    if (Number.isNaN(n) || n < 1 || n > 100) {
      setDiscountInput(item.discountPercent != null ? String(item.discountPercent) : '');
      return;
    }

    if (n !== item.discountPercent) {
      onDiscountChange(n);
    }
  }

  const stockProps = useLocalizedDigits(stockInput, setStockInput, {
    type: 'number',
    dir: 'ltr',
  });

  const discountProps = useLocalizedDigits(discountInput, setDiscountInput, {
    type: 'number',
    dir: 'ltr',
  });

  const stockTone =
    item.stock === 0 ? styles.stockDanger : item.stock <= 5 ? styles.stockWarning : undefined;
  const hasDiscount = item.discountPercent != null && item.discountPercent > 0;

  return (
    <li className={clsx(styles.row, hasDiscount && styles.discountedRow)}>
      <div className={styles.topRow}>
        <label className={styles.selectWrap}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selected}
            onChange={(e) => onSelectToggle(e.target.checked)}
            aria-label={`انتخاب ${item.food.name}`}
          />
        </label>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{item.food.name}</span>
            {hasDiscount && (
              <span className={styles.discountPill} dir="ltr">
                تخفیف {formatNumber(item.discountPercent!)}٪
              </span>
            )}
          </div>
          <span className={styles.category}>{item.food.category.name}</span>
          <PriceWithDiscount
            originalPrice={item.food.price}
            salePrice={item.salePrice}
            discountPercent={item.discountPercent}
            size="sm"
            showBadge={false}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.stockGroup}>
          <label className={styles.stockLabel} htmlFor={`stock-${item.id}`}>
            موجودی
          </label>
          <div className={styles.stockRow}>
            <input
              id={`stock-${item.id}`}
              className={clsx(styles.stockInput, stockTone)}
              onBlur={handleStockBlur}
              {...stockProps}
            />
            {item.stock <= 5 && (
              <span className={clsx(styles.stockBadge, stockTone)}>
                {item.stock === 0 ? 'ناموجود' : 'کم موجود'}
              </span>
            )}
          </div>
        </div>

        <div className={styles.discountGroup}>
          <label className={styles.stockLabel} htmlFor={`discount-${item.id}`}>
            تخفیف %
          </label>
          <input
            id={`discount-${item.id}`}
            className={styles.discountInput}
            placeholder="—"
            onBlur={handleDiscountBlur}
            {...discountProps}
          />
        </div>

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
