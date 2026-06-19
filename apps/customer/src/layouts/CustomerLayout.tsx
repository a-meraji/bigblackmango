import { Outlet } from 'react-router-dom';
import TopNav from '@features/customer/home/components/TopNav';
import FloatingCartBar from '@features/customer/cart/components/FloatingCartBar';
import CartModal from '@features/customer/cart/components/CartModal';
import BottomNav from '@layouts/BottomNav';
import { ErrorBoundary } from '@components/error-boundary/ErrorBoundary';
import { useCartAuthSync } from '../app-hooks/useCartAuthSync';
import { useCartInit } from '../app-hooks/useCartInit';
import { useIsLandingPage } from '@hooks/useIsLandingPage';
import styles from './CustomerLayout.module.css';

export default function CustomerLayout() {
  useCartInit();
  useCartAuthSync();
  const isLandingPage = useIsLandingPage();

  return (
    <div className={styles.wrapper}>
      <TopNav landingMode={isLandingPage} />
      <main id="main-content" className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {!isLandingPage && (
        <>
          <FloatingCartBar />
          <CartModal />
          <BottomNav />
        </>
      )}
    </div>
  );
}
