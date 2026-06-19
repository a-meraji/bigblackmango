import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Modal from '@components/modal/Modal';
import EmptyState from '@components/empty-state/EmptyState';
import Skeleton from '@components/skeleton/Skeleton';
import { useCartStore } from '@store/cart.store';
import { useCart } from '@features/customer/cart/hooks/useCart';
import CartItemRow from './CartItemRow';
import CartSummaryFooter from './CartSummaryFooter';
import CartUnavailableBanner from './CartUnavailableBanner';
import styles from './CartModal.module.css';
import { formatNumber } from '@utils/locale';

export default function CartModal() {
  const navigate = useNavigate();
  const { isOpen, closeCart, cart, hasUnavailableItems } = useCartStore();
  const { isFetching } = useCart();
  const showUnavailableBanner = hasUnavailableItems();

  const itemCount = cart?.items.length ?? 0;
  const title =
    itemCount > 0 ? `سبد خرید (${formatNumber(itemCount)} مورد)` : 'سبد خرید';

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeCart}
      title={title}
      size="md"
      closeOnBackdropClick
      dialogClassName={styles.cartDialog}
      bodyClassName={styles.cartBody}
    >
      {isFetching && !cart ? (
        <div className={styles.loading} role="status" aria-label="در حال بارگذاری">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={56} className={styles.skeletonRow} borderRadius="var(--radius-md)" />
          ))}
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={ShoppingBag}
            title="سبد خرید خالی است"
            description="از منوی امروز غذای مورد علاقه‌تان را انتخاب کنید."
            actionLabel="مشاهده منو"
            onAction={() => {
              closeCart();
              navigate('/');
            }}
          />
        </div>
      ) : (
        <div className={styles.shell}>
          {showUnavailableBanner && <CartUnavailableBanner />}
          <ul className={styles.list}>
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>
          <CartSummaryFooter cart={cart} />
        </div>
      )}
    </Modal>
  );
}
