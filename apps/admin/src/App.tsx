import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { queryClient } from '@query-client';
import AuthReauthModal from '@components/auth-reauth-modal/AuthReauthModal';
import { useAuthInit } from '@hooks/useAuthInit';
import { useAuthQueryRecovery } from '@hooks/useAuthQueryRecovery';
import { useAuthSessionRecovery } from '@hooks/useAuthSessionRecovery';
import { useAuthStorageSync } from '@hooks/useAuthStorageSync';
import { useProactiveTokenRefresh } from '@hooks/useProactiveTokenRefresh';
import SkipLink from '@components/skip-link/SkipLink';
import ToastContainer from '@components/toast/ToastContainer';

// Admin is a plain web app: no PwaInstallModal / NotificationPermissionModal (PWA-only UI),
// no service worker. Auth + toast infrastructure is shared with the customer app.
function AppInner() {
  useAuthInit();
  useAuthSessionRecovery();
  useAuthStorageSync();
  useProactiveTokenRefresh();
  useAuthQueryRecovery();

  return (
    <>
      <SkipLink />
      <RouterProvider router={router} />
      <AuthReauthModal />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
