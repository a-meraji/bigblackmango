import { useEffect } from 'react';
import { reconcilePushSubscription } from '@hooks/usePushNotifications';

/**
 * Run once on app load: if the user already granted notification permission, make sure a live
 * push subscription exists and is registered with the backend. Keeps delivery working across
 * cleared storage / rotated subscriptions without ever prompting. No-op when not granted.
 */
export function usePushReconcile(): void {
  useEffect(() => {
    reconcilePushSubscription().catch(() => undefined);
  }, []);
}
