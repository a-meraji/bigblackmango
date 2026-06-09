import { useState } from 'react';
import clsx from 'clsx';
import { AlertCircle, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@t/cart';
import {
  removeItemFromCart,
  updateItemQuantity,
} from '@features/customer/cart/cart-operations';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@hooks/useToast';
import PriceWithDiscount from '@components/price-with-discount/PriceWithDiscount';
import { formatPrice } from '@utils/format-price';
import { issueFromCartError } from '@utils/cart-item-issues';
import Icon from '@components/icon/Icon';
import Button from '@components/button/Button';
import styles from './CartItemRow.module.css';
import { formatNumber } from '@utils/locale';

interface Props {
  item: CartItem;
}

export default function CartItemRow({ item }: Props) {
  const [loading, setLoading] = useState(false);
  const syncCart = useCartStore((s) => s.syncCart);
  const setItemIssue = useCartStore((s) => s.setItemIssue);
  const clearItemIssue = useCartStore((s) => s.clearItemIssue);
  const issue = useCartStore((s) => s.itemIssues[item.id]);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();
  const toast = useToast();

  const isUnavailable = issue?.type === 'unavailable';
  const maxQuantity = issue?.type === 'limited' ? issue.maxQuantity : undefined;
  const atMax = maxQuantity != null && item.quantity >= maxQuantity;
  const hasMenuDiscount =
    item.menuDiscountPercent != null &&
    item.originalUnitPrice != null &&
    item.unitPrice < item.originalUnitPrice;

  async function handleRemove() {
    setLoading(true);
    try {
      const updatedCart = await removeItemFromCart(item.id);
      syncCart(updatedCart);
      clearItemIssue(item.id);
      if (isAuthenticated) {
        qc.setQueryData(['cart'], updatedCart);
      }
    } catch {
      toast.error('خطا در حذف از سبد.');
      qc.invalidateQueries({ queryKey: ['cart'] });
    } finally {
      setLoading(false);
    }
  }

  async function handleQtyChange(newQty: number) {
    if (isUnavailable) return;

    if (newQty <= 0) {
      await handleRemove();
      return;
    }

    if (maxQuantity != null && newQty > maxQuantity) {
      toast.warning(`حداکثر ${formatNumber(maxQuantity)} عدد از این غذا موجود است.`);
      return;
    }

    setLoading(true);
    try {
      const updatedCart = await updateItemQuantity(item.id, newQty);
      syncCart(updatedCart);
      clearItemIssue(item.id);
      if (isAuthenticated) {
        qc.setQueryData(['cart'], updatedCart);
      }
    } catch (err: unknown) {
      const apiErr = err as {
        code?: string;
        message?: string;
        details?: Array<{
          menuItemId: string;
          requestedQuantity: number;
          availableQuantity: number;
        }>;
      };

      const parsedIssue = issueFromCartError(item.menuItemId, apiErr.code ?? '', apiErr.details);

      if (parsedIssue?.type === 'unavailable') {
        setItemIssue(item.id, parsedIssue);
        toast.error('این غذا دیگر در منوی امروز موجود نیست. می‌توانید آن را از سبد حذف کنید.');
      } else if (parsedIssue?.type === 'limited') {
        setItemIssue(item.id, parsedIssue);
        toast.warning(
          `فقط ${formatNumber(parsedIssue.maxQuantity)} عدد از «${item.food.name}» موجود است.`,
        );
      } else {
        toast.error(apiErr.message ?? 'تغییر تعداد ممکن نیست. لطفاً دوباره تلاش کنید.');
      }

      qc.invalidateQueries({ queryKey: ['cart'] });
    } finally {
      setLoading(false);
    }
  }

  if (isUnavailable) {
    return (
      <li className={clsx(styles.row, styles.unavailable)} aria-live="polite">
        <div className={styles.unavailableMain}>
          <div className={styles.unavailableHeader}>
            <Icon icon={AlertCircle} size="sm" decorative />
            <span className={styles.name}>{item.food.name}</span>
          </div>
          <p className={styles.unavailableMsg} role="status">
            این غذا دیگر در منوی امروز موجود نیست.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={styles.removeBtn}
          onClick={handleRemove}
          loading={loading}
          aria-label={`حذف ${item.food.name} از سبد`}
        >
          <Icon icon={Trash2} size="sm" decorative />
          حذف از سبد
        </Button>
      </li>
    );
  }

  return (
    <li className={clsx(styles.row, issue?.type === 'limited' && styles.limited)}>
      <div className={styles.main}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{item.food.name}</span>
          {hasMenuDiscount && (
            <span className={styles.discountBadge} dir="ltr">
              −{formatNumber(item.menuDiscountPercent!)}٪
            </span>
          )}
        </div>
        {issue?.type === 'limited' && (
          <p className={styles.limitedMsg} role="status">
            فقط {formatNumber(maxQuantity!)} عدد موجود است
          </p>
        )}
        <div className={styles.priceRow}>
          {hasMenuDiscount ? (
            <PriceWithDiscount
              originalPrice={item.originalUnitPrice!}
              salePrice={item.unitPrice}
              discountPercent={item.menuDiscountPercent}
              size="sm"
              layout="inline"
              showBadge={false}
            />
          ) : (
            <span className={styles.unitPrice}>{formatPrice(item.unitPrice)}</span>
          )}
          <span className={styles.lineTotal}>{formatPrice(item.lineTotal)}</span>
        </div>
      </div>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepBtn}
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={loading}
          aria-label={item.quantity === 1 ? 'حذف از سبد' : 'کاهش تعداد'}
        >
          <Icon icon={item.quantity === 1 ? Trash2 : Minus} size="sm" decorative />
        </button>
        <span className={styles.qty} aria-live="polite">
          {formatNumber(item.quantity)}
        </span>
        <button
          type="button"
          className={styles.stepBtn}
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={loading || atMax}
          aria-label="افزایش تعداد"
        >
          <Icon icon={Plus} size="sm" decorative />
        </button>
      </div>
    </li>
  );
}
