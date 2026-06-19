import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
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
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
