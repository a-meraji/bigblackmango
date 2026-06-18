/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Precache the customer app shell injected by vite-plugin-pwa (see vite.config injectManifest).
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

// On-demand customer JS/CSS chunks — not precached, so cache them as they're first used.
// Admin chunks (admin-*, admin-vendor-*) are deliberately excluded: admin is web-only and
// must never enter the PWA's cache storage.
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/assets/') &&
    !url.pathname.startsWith('/assets/admin-') &&
    (request.destination === 'script' || request.destination === 'style'),
  new StaleWhileRevalidate({ cacheName: 'app-chunks' }),
);

// Fonts — immutable, hashed; cache long-term.
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  }),
);

// SPA navigation fallback — serve the precached shell for customer routes; let /admin and
// /api fall through to the network (admin is not precached).
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/admin/, /^\/api/],
  }),
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

  const title = data.title ?? 'بلک منگو 🥭';
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
    actions: [{ action: 'open', title: data.actionLabel ?? 'مشاهده منو' }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event: NotificationClickEvent) => {
  event.notification.close();

  const targetUrl: string = (event.notification.data as { url?: string })?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
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
