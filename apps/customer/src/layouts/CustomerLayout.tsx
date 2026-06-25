import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import TopNav from '@features/customer/home/components/TopNav';
import FloatingCartBar from '@features/customer/cart/components/FloatingCartBar';
import CartModal from '@features/customer/cart/components/CartModal';
import BottomNav from '@layouts/BottomNav';
import { ErrorBoundary } from '@components/error-boundary/ErrorBoundary';
import ReviewPromptSheet from '@features/customer/orders/components/ReviewPromptSheet';
import { ReviewPromptProvider } from '@features/customer/orders/context/ReviewPromptContext';
import { useCartAuthSync } from '../app-hooks/useCartAuthSync';
import { useCartInit } from '../app-hooks/useCartInit';
import { useIsLandingPage } from '@hooks/useIsLandingPage';
import styles from './CustomerLayout.module.css';

export default function CustomerLayout() {
  useCartInit();
  useCartAuthSync();
  const isLandingPage = useIsLandingPage();

  return (
    <ReviewPromptProvider>
      <div className={styles.wrapper}>
        <TopNav landingMode={isLandingPage} />
        <main
          id="main-content"
          className={clsx(styles.main, !isLandingPage && styles.withBottomNavInset)}
        >
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
        <ReviewPromptSheet />
      </div>
    </ReviewPromptProvider>
  );
}
