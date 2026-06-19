import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import RequireAuth from '@components/require-auth/RequireAuth';
import RouteError from '@components/error-boundary/RouteError';
import { lazyPage } from './router/pageBoundary';

// Layouts
import CustomerLayout from '@layouts/CustomerLayout';

// Auth — eager (small, always needed)
import OtpPage from '@pages/auth/OtpPage';

// Customer pages — lazy loaded
const HomePage = lazy(() => import('@pages/customer/HomePage'));
const MenuPage = lazy(() => import('@pages/customer/MenuPage'));
const FoodDetailPage = lazy(() => import('@pages/customer/FoodDetailPage'));
const PartyServicePage = lazy(() => import('@pages/customer/PartyServicePage'));
const CheckoutPage = lazy(() => import('@pages/customer/CheckoutPage'));
const PaymentPage = lazy(() => import('@pages/customer/PaymentPage'));
const PaymentCallbackPage = lazy(() => import('@pages/customer/PaymentCallbackPage'));
const OrdersPage = lazy(() => import('@pages/customer/OrdersPage'));
const ProfilePage = lazy(() => import('@pages/customer/ProfilePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: lazyPage(<HomePage />) },
      { path: 'menu', element: lazyPage(<MenuPage />) },
      { path: 'foods/:foodId', element: lazyPage(<FoodDetailPage />) },
      { path: 'party-services/:serviceId', element: lazyPage(<PartyServicePage />) },
      { path: 'checkout', element: lazyPage(<CheckoutPage />) },
      {
        path: 'payment',
        element: <RequireAuth>{lazyPage(<PaymentPage />)}</RequireAuth>,
      },
      { path: 'payment/callback', element: lazyPage(<PaymentCallbackPage />) },
      {
        path: 'orders',
        element: <RequireAuth>{lazyPage(<OrdersPage />)}</RequireAuth>,
      },
      {
        path: 'profile',
        element: <RequireAuth>{lazyPage(<ProfilePage />)}</RequireAuth>,
      },
    ],
  },

  { path: '/auth/otp', element: <OtpPage />, errorElement: <RouteError /> },
]);
