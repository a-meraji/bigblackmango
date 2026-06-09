import { useEffect, useRef } from 'react';
import { tryRecoverSession } from '@api/auth-session';
import { hasStoredTokens } from '@api/token-storage';
import { useAuthStore } from '@store/auth.store';

const RECOVERY_DEBOUNCE_MS = 500;

/**
 * When boot failed transiently but tokens remain, retry session restore
 * on reconnect or when the tab becomes visible again.
 */
export function useAuthSessionRecovery() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleRecovery() {
      if (isLoading || isAuthenticated || !hasStoredTokens()) {
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        void tryRecoverSession();
      }, RECOVERY_DEBOUNCE_MS);
    }

    function onOnline() {
      scheduleRecovery();
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        scheduleRecovery();
      }
    }

    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, isAuthenticated]);
}
