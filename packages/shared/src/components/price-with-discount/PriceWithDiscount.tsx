import clsx from 'clsx';
import { formatPrice } from '@utils/format-price';
import { formatNumber } from '@utils/locale';
import styles from './PriceWithDiscount.module.css';

type Size = 'sm' | 'md' | 'lg';
type Layout = 'stacked' | 'inline';

interface Props {
  originalPrice: number;
  salePrice?: number;
  discountPercent?: number | null;
  size?: Size;
  layout?: Layout;
  showBadge?: boolean;
  className?: string;
}

function hasDiscount(
  originalPrice: number,
  salePrice: number | undefined,
  discountPercent: number | null | undefined,
): boolean {
  return (
    discountPercent != null &&
    discountPercent > 0 &&
    salePrice != null &&
    salePrice < originalPrice
  );
}

export default function PriceWithDiscount({
  originalPrice,
  salePrice,
  discountPercent,
  size = 'md',
  layout = 'stacked',
  showBadge = true,
  className,
}: Props) {
  const discounted = hasDiscount(originalPrice, salePrice, discountPercent);
  const effectiveSalePrice = salePrice ?? originalPrice;

  if (!discounted) {
    return (
      <span className={clsx(styles.root, className)} dir="ltr">
        <span className={clsx(styles.regular, styles[`regular${capitalize(size)}`])}>
          {formatPrice(originalPrice)}
        </span>
      </span>
    );
  }

  const badge = showBadge ? (
    <span className={clsx(styles.badge, styles[`badge${capitalize(size)}`])} dir="ltr">
      −{formatNumber(discountPercent!)}٪
    </span>
  ) : null;

  if (layout === 'inline') {
    return (
      <span className={clsx(styles.rootInline, className)} dir="ltr">
        {badge}
        <span className={clsx(styles.original, styles[`original${capitalize(size)}`])}>
          {formatPrice(originalPrice)}
        </span>
        <span className={clsx(styles.sale, styles[`sale${capitalize(size)}`])}>
          {formatPrice(effectiveSalePrice)}
        </span>
      </span>
    );
  }

  return (
    <span className={clsx(styles.root, className)} dir="ltr">
      {badge && <span className={styles.badgeRow}>{badge}</span>}
      <span className={clsx(styles.original, styles[`original${capitalize(size)}`])}>
        {formatPrice(originalPrice)}
      </span>
      <span className={clsx(styles.sale, styles[`sale${capitalize(size)}`])}>
        {formatPrice(effectiveSalePrice)}
      </span>
    </span>
  );
}

function capitalize(size: Size): 'Sm' | 'Md' | 'Lg' {
  if (size === 'sm') return 'Sm';
  if (size === 'lg') return 'Lg';
  return 'Md';
}
