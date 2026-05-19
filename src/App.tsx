import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthInit } from '@hooks/useAuthInit';
import SkipLink from '@components/skip-link/SkipLink';
import ToastContainer from '@components/toast/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const apiErr = error as { code?: string };
        if (['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'].includes(apiErr.code ?? '')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

function AppInner() {
  useAuthInit();
  return (
    <>
      <SkipLink />
      <RouterProvider router={router} />
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
