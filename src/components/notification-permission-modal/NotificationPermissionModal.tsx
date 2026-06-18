import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { isInStandaloneMode } from '@hooks/usePwaInstall';
import { useIsLandingPage, useIsAdminRoute } from '@hooks/useIsLandingPage';
import { usePushNotifications } from '@hooks/usePushNotifications';
import styles from './NotificationPermissionModal.module.css';

const DISMISS_KEY = 'bbm_notif_modal_dismissed_until';
const SNOOZE_DAYS = 7;

function isDismissed(): boolean {
  const until = localStorage.getItem(DISMISS_KEY);
  if (!until) return false;
  return Date.now() < Number(until);
}

function snooze(): void {
  const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

function dismissForever(): void {
  // Set far-future timestamp (10 years)
  localStorage.setItem(DISMISS_KEY, String(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000));
}

export default function NotificationPermissionModal() {
  const isLandingPage = useIsLandingPage();
  const isAdminRoute = useIsAdminRoute();
  const { permission, isSubscribed, isSupported, subscribe, isLoading } = usePushNotifications();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLandingPage || isAdminRoute) return;
    if (!isSupported) return;
    if (isSubscribed) return;
    if (permission !== 'default') return;
    if (isDismissed()) return;

    // Only prompt inside installed PWA — or after install prompt is gone
    const standalone = isInStandaloneMode();
    if (!standalone) {
      // On browser, wait 30s then show (they may not install but still want notifs)
      const t = setTimeout(() => setIsOpen(true), 30_000);
      return () => clearTimeout(t);
    }

    // In standalone, show after 3s
    const t = setTimeout(() => setIsOpen(true), 3000);
    return () => clearTimeout(t);
  }, [isSupported, isSubscribed, permission, isLandingPage, isAdminRoute]);

  async function handleAccept() {
    const result = await subscribe();
    if (result === 'subscribed') {
      dismissForever();
      setIsOpen(false);
    } else if (result === 'denied') {
      dismissForever();
      setIsOpen(false);
    }
    // 'error' — keep open so user can try again? No, close and snooze
    if (result === 'error') {
      snooze();
      setIsOpen(false);
    }
  }

  function handleSnooze() {
    snooze();
    setIsOpen(false);
  }

  if (!isOpen || isLandingPage || isAdminRoute) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className={styles.sheet}>
        <button type="button" className={styles.closeBtn} onClick={handleSnooze} aria-label="بستن">
          <X size={18} />
        </button>

        <div className={styles.bellWrap} aria-hidden="true">
          <Bell size={32} />
        </div>

        <h2 id="notif-modal-title" className={styles.title}>
          منوی روزانه رو دریافت کن 🔔
        </h2>
        <p className={styles.body}>
          هر روز ساعت ۱۰:۳۰ بهت خبر می‌دیم چی امروز داریم — قبل از اینکه تموم بشه سفارش بدی!
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.acceptBtn}
            onClick={handleAccept}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'در حال فعال‌سازی...' : 'آره، خبرم کن 🔔'}
          </button>
          <button type="button" className={styles.snoozeBtn} onClick={handleSnooze}>
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
}
