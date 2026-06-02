import { useState } from 'react';
import { apiClient } from '@api/client';

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

export type SubscribeResult = 'subscribed' | 'denied' | 'unsupported' | 'error';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );
  const [isSubscribed, setIsSubscribed] = useState(
    () => localStorage.getItem('bbm_push_subscribed') === '1',
  );
  const [isLoading, setIsLoading] = useState(false);

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  async function subscribe(): Promise<SubscribeResult> {
    if (!isSupported) return 'unsupported';
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return 'denied';

      const vapidKey = await fetchVapidPublicKey();
      const appServerKey = await urlBase64ToUint8Array(vapidKey);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });

      const p256dh = sub.getKey('p256dh');
      const auth = sub.getKey('auth');
      if (!p256dh || !auth) throw new Error('Missing push keys');

      await apiClient.post('/notifications/subscribe', {
        endpoint: sub.endpoint,
        p256dh: arrayBufferToBase64(p256dh),
        auth: arrayBufferToBase64(auth),
      });

      setIsSubscribed(true);
      localStorage.setItem('bbm_push_subscribed', '1');
      return 'subscribed';
    } catch {
      return 'error';
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe(): Promise<void> {
    if (!isSupported) return;
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
      localStorage.removeItem('bbm_push_subscribed');
    }
  }

  return { permission, isSubscribed, isLoading, isSupported, subscribe, unsubscribe };
}
