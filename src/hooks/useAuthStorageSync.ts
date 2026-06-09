import { useEffect } from 'react';
import { tryRecoverSession } from '@api/auth-session';
import {
  ACCESS_TOKEN_KEY,
  AUTH_STORAGE_KEYS,
  REFRESH_TOKEN_KEY,
  hasStoredTokens,
} from '@api/token-storage';
import { useAuthStore } from '@store/auth.store';

/**
 * Keeps auth state in sync across browser tabs via localStorage events.
 */
export function useAuthStorageSync() {
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (!event.key || !AUTH_STORAGE_KEYS.includes(event.key as (typeof AUTH_STORAGE_KEYS)[number])) {
        return;
      }

      const hadTokens = !!(event.oldValue && event.oldValue !== 'undefined' && event.oldValue !== 'null');
      const hasTokens = hasStoredTokens();

      if (hadTokens && !hasTokens) {
        useAuthStore.getState().clearUser();
        return;
      }

      if (
        hasTokens &&
        !useAuthStore.getState().isAuthenticated &&
        (event.key === ACCESS_TOKEN_KEY || event.key === REFRESH_TOKEN_KEY)
      ) {
        void tryRecoverSession();
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
}
