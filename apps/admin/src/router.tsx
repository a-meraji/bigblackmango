import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import RequireAdmin from '@components/require-auth/RequireAdmin';
import RouteError from '@components/error-boundary/RouteError';
import { lazyPage } from './router/pageBoundary';

// Layouts
import AdminLayout from '@layouts/AdminLayout';

// Auth — eager (small, always needed)
import OtpPage from '@pages/auth/OtpPage';

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
  // Subdomain root → dashboard. Routes keep their original `/admin/...` paths so admin-nav
  // and every existing link work unchanged.
  { index: true, path: '/', element: <Navigate to="/admin" replace /> },

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
