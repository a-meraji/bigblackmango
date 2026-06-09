import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@store/auth.store';

/**
 * Refetch cached data after inline re-auth completes successfully.
 */
export function useAuthQueryRecovery() {
  const reauthOpen = useAuthStore((s) => s.reauthOpen);
  const wasReauthOpen = useRef(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (wasReauthOpen.current && !reauthOpen) {
      void qc.invalidateQueries();
    }
    wasReauthOpen.current = reauthOpen;
  }, [reauthOpen, qc]);
}
