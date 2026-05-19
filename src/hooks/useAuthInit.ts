import { useEffect } from 'react';
import { getMe } from '@api/auth';
import { useAuthStore } from '@store/auth.store';

/**
 * Called once at App root. Checks if the user has a valid session cookie
 * by hitting GET /me. Sets user if authenticated, clears if 401 (guest).
 * `isLoading` starts as true and resolves after this call completes.
 */
export function useAuthInit() {
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    getMe()
      .then((user) => setUser(user))
      .catch(() => clearUser()); // 401 = guest, not an error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
