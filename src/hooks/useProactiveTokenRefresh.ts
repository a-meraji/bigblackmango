import { useEffect, useRef } from 'react';
import { ensureFreshAccessToken } from '@api/auth-session';
import { useAuthStore } from '@store/auth.store';

const PROACTIVE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Periodically and on tab focus refreshes the access token before it expires.
 */
export function useProactiveTokenRefresh() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const reauthOpen = useAuthStore((s) => s.reauthOpen);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || reauthOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    function refreshIfNeeded() {
      void ensureFreshAccessToken();
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshIfNeeded();
      }
    }

    refreshIfNeeded();
    intervalRef.current = setInterval(refreshIfNeeded, PROACTIVE_REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated, reauthOpen]);
}
