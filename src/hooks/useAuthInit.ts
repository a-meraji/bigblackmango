import { useEffect } from 'react';
import { resolveBootSession } from '@api/auth-session';

/**
 * Called once at App root. Restores session via GET /me with retries.
 * Only clears auth on definitive UNAUTHORIZED; preserves tokens on transient errors.
 */
export function useAuthInit() {
  useEffect(() => {
    void resolveBootSession();
  }, []);
}
