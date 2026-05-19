import { Outlet } from 'react-router-dom';
import TopNav from '@features/customer/home/components/TopNav';
import FloatingCartBar from '@features/customer/cart/components/FloatingCartBar';
import CartModal from '@features/customer/cart/components/CartModal';
import BottomNav from '@layouts/BottomNav';
import { ErrorBoundary } from '@components/error-boundary/ErrorBoundary';
import { useCartAuthSync } from '@hooks/useCartAuthSync';
import { useCartInit } from '@hooks/useCartInit';
import styles from './CustomerLayout.module.css';

export default function CustomerLayout() {
  useCartInit();
  useCartAuthSync();

  return (
    <div className={styles.wrapper}>
      <TopNav />
      <main id="main-content" className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <FloatingCartBar />
      <CartModal />
      <BottomNav />
    </div>
  );
}
