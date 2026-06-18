import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import RequireAuth from '@components/require-auth/RequireAuth';
import RequireAdmin from '@components/require-auth/RequireAdmin';
import RouteError from '@components/error-boundary/RouteError';
import { lazyPage } from './router/pageBoundary';

// Layouts
import CustomerLayout from '@layouts/CustomerLayout';
// AdminLayout is lazy — admin code stays out of the customer entry bundle / PWA.
const AdminLayout = lazy(() => import('@layouts/AdminLayout'));

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

// Admin pages — lazy loaded
const DashboardPage = lazy(() => import('@pages/admin/DashboardPage'));
const CategoriesPage = lazy(() => import('@pages/admin/CategoriesPage'));
const FoodsPage = lazy(() => import('@pages/admin/FoodsPage'));
const DailyMenuPage = lazy(() => import('@pages/admin/DailyMenuPage'));
const StoriesPage = lazy(() => import('@pages/admin/StoriesPage'));
const BannersPage = lazy(() => import('@pages/admin/BannersPage'));
const PartyServicesPage = lazy(() => import('@pages/admin/PartyServicesPage'));
const LandingAdminPage = lazy(() => import('@pages/admin/LandingPage'));
const AdminOrdersPage = lazy(() => import('@pages/admin/OrdersPage'));
const DiscountCodesPage = lazy(() => import('@pages/admin/DiscountCodesPage'));
const AdminReviewsPage = lazy(() => import('@pages/admin/ReviewsPage'));
const NotificationsPage = lazy(() => import('@pages/admin/NotificationsPage'));

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

  {
    path: '/admin',
    element: <RequireAdmin>{lazyPage(<AdminLayout />)}</RequireAdmin>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: lazyPage(<DashboardPage />) },
      { path: 'categories', element: lazyPage(<CategoriesPage />) },
      { path: 'foods', element: lazyPage(<FoodsPage />) },
      { path: 'daily-menu', element: lazyPage(<DailyMenuPage />) },
      { path: 'stories', element: lazyPage(<StoriesPage />) },
      { path: 'banners', element: lazyPage(<BannersPage />) },
      { path: 'party-services', element: lazyPage(<PartyServicesPage />) },
      { path: 'landing', element: lazyPage(<LandingAdminPage />) },
      { path: 'orders', element: lazyPage(<AdminOrdersPage />) },
      { path: 'discount-codes', element: lazyPage(<DiscountCodesPage />) },
      { path: 'reviews', element: lazyPage(<AdminReviewsPage />) },
      { path: 'notifications', element: lazyPage(<NotificationsPage />) },
    ],
  },
]);
