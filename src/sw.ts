/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache everything injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Runtime cache for menu/home API calls
registerRoute(
  ({ url }) => /\/api\/v1\/(home|menu\/today|categories)/.test(url.pathname),
  new NetworkFirst({
    cacheName: 'api-menu',
    fetchOptions: { credentials: 'include' },
    networkTimeoutSeconds: 10,
  }),
);

// SPA navigation fallback — skip /admin (SSR-style or separate bundle)
const adminPattern = /^\/admin/;
registerRoute(
  new NavigationRoute(
    async ({ request }) => {
      if (adminPattern.test(new URL(request.url).pathname)) {
        return fetch(request);
      }
      const cache = await caches.open('workbox-precache-v2');
      const cached = await cache.match('/index.html');
      return cached ?? fetch(request);
    },
  ),
);

// ─── PUSH ────────────────────────────────────────────────────────────────────

interface PushData {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actionLabel?: string;
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let data: PushData = {};
  try {
    data = event.data.json() as PushData;
  } catch {
    data = { body: event.data.text() };
  }

  const title = data.title ?? 'بیگ بلک منگو 🥭';
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: data.icon ?? '/icons/icon-192.png',
    badge: data.badge ?? '/icons/badge-72.png',
    tag: data.tag ?? 'bbm-push',
    renotify: true,
    requireInteraction: false,
    dir: 'rtl',
    lang: 'fa',
    data: { url: data.url ?? '/' },
    actions: [
      { action: 'open', title: data.actionLabel ?? 'مشاهده منو' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event: NotificationClickEvent) => {
  event.notification.close();

  const targetUrl: string = (event.notification.data as { url?: string })?.url ?? '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => 'navigate' in c);
        if (existing) {
          return (existing as WindowClient).focus().then((c) => c.navigate(targetUrl));
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});

// ─── PUSH SUBSCRIPTION CHANGE ────────────────────────────────────────────────
// Fires when the browser rotates the subscription — re-register automatically

self.addEventListener('pushsubscriptionchange', (event: Event) => {
  const e = event as PushSubscriptionChangeEvent;

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: e.oldSubscription?.options.applicationServerKey,
      })
      .then((sub) => {
        const p256dh = sub.getKey('p256dh');
        const auth = sub.getKey('auth');
        if (!p256dh || !auth) return;

        return fetch('/api/v1/notifications/subscribe', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
            auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
          }),
        });
      }),
  );
});
