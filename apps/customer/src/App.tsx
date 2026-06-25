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
import { usePushReconcile } from '@hooks/usePushReconcile';
import SkipLink from '@components/skip-link/SkipLink';
import ToastContainer from '@components/toast/ToastContainer';
import PwaInstallModal from '@components/pwa-install-modal/PwaInstallModal';
import NotificationPermissionModal from '@components/notification-permission-modal/NotificationPermissionModal';

function AppInner() {
  useAuthInit();
  useAuthSessionRecovery();
  useAuthStorageSync();
  useProactiveTokenRefresh();
  useAuthQueryRecovery();
  usePushReconcile();

  return (
    <>
      <SkipLink />
      <RouterProvider router={router} />
      <AuthReauthModal />
      <ToastContainer />
      <PwaInstallModal />
      <NotificationPermissionModal />
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
