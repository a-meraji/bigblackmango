import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@api/client';

const SUBSCRIBED_KEY = 'bbm_push_subscribed';

async function urlBase64ToUint8Array(base64: string): Promise<Uint8Array> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function fetchVapidPublicKey(): Promise<string> {
  const res = await apiClient.get<{ data: { publicKey: string } }>(
    '/notifications/vapid-public-key',
  );
  return res.data.data.publicKey;
}

/** Push is only usable when SW, PushManager and Notification are all present. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** POST a subscription to the backend (idempotent upsert — keeps the row active and fresh). */
async function postSubscription(sub: PushSubscription): Promise<void> {
  const p256dh = sub.getKey('p256dh');
  const auth = sub.getKey('auth');
  if (!p256dh || !auth) throw new Error('Missing push keys');

  await apiClient.post('/notifications/subscribe', {
    endpoint: sub.endpoint,
    p256dh: arrayBufferToBase64(p256dh),
    auth: arrayBufferToBase64(auth),
  });
}

/** Reuse the live subscription if present, otherwise create a fresh one against our VAPID key. */
async function ensureSubscription(
  reg: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const vapidKey = await fetchVapidPublicKey();
  const appServerKey = await urlBase64ToUint8Array(vapidKey);
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appServerKey as BufferSource,
  });
}

/**
 * Keep the subscription alive for as long as the user keeps permission. If the OS permission is
 * granted but the browser has no live subscription (cleared storage, rotated/expired key), this
 * silently re-subscribes; if one exists it re-POSTs so the backend keeps the row active. Safe to
 * call on every app load — does nothing when permission isn't granted.
 */
export async function reconcilePushSubscription(): Promise<void> {
  if (!isPushSupported() || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await ensureSubscription(reg);
  await postSubscription(sub);
  localStorage.setItem(SUBSCRIBED_KEY, '1');
}

export type SubscribeResult = 'subscribed' | 'denied' | 'unsupported' | 'error';

export function usePushNotifications() {
  const supported = isPushSupported();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );
  const [isSubscribed, setIsSubscribed] = useState(
    () => localStorage.getItem(SUBSCRIBED_KEY) === '1',
  );
  const [isLoading, setIsLoading] = useState(false);

  // Reconcile the cached flag against the browser's real subscription on mount.
  useEffect(() => {
    if (!supported || Notification.permission !== 'granted') return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        const live = Boolean(sub);
        setIsSubscribed(live);
        if (!live) localStorage.removeItem(SUBSCRIBED_KEY);
      })
      .catch(() => undefined);
  }, [supported]);

  const subscribe = useCallback(async (): Promise<SubscribeResult> => {
    if (!supported) return 'unsupported';
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return 'denied';

      const sub = await ensureSubscription(reg);
      await postSubscription(sub);

      setIsSubscribed(true);
      localStorage.setItem(SUBSCRIBED_KEY, '1');
      return 'subscribed';
    } catch {
      return 'error';
    } finally {
      setIsLoading(false);
    }
  }, [supported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiClient.delete('/notifications/subscribe', {
          data: { endpoint: sub.endpoint },
        });
        await sub.unsubscribe();
      }
    } finally {
      setIsSubscribed(false);
      localStorage.removeItem(SUBSCRIBED_KEY);
    }
  }, [supported]);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported: supported,
    subscribe,
    unsubscribe,
  };
}
