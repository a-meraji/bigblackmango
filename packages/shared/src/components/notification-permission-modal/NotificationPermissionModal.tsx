import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useIsLandingPage, useIsAdminRoute } from '@hooks/useIsLandingPage';
import { usePushNotifications } from '@hooks/usePushNotifications';
import styles from './NotificationPermissionModal.module.css';

// Soft-ask priming: a costless "later" dismiss that only lasts the session, so the next app
// launch asks again. We never offer a permanent opt-out — the only way to lose the ability to
// prompt is the OS prompt itself, which we fire ONLY on an explicit "Enable" tap (high intent →
// far fewer permanent denials than auto-prompting).
const SESSION_DISMISS_KEY = 'bbm_notif_dismissed';
const SHOW_DELAY_MS = 1200;

function isDismissedThisSession(): boolean {
  return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1';
}

function dismissForSession(): void {
  sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
}

export default function NotificationPermissionModal() {
  const isLandingPage = useIsLandingPage();
  const isAdminRoute = useIsAdminRoute();
  const { permission, isSubscribed, isSupported, subscribe, isLoading } =
    usePushNotifications();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLandingPage || isAdminRoute) return;
    if (!isSupported) return;
    if (isSubscribed) return;
    // Only `default` can be prompted — `granted` needs nothing, `denied` can't be re-prompted.
    if (permission !== 'default') return;
    if (isDismissedThisSession()) return;

    // Surface quickly on any in-app page so we capture permission as early as possible.
    const t = setTimeout(() => setIsOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [isSupported, isSubscribed, permission, isLandingPage, isAdminRoute]);

  async function handleAccept() {
    const result = await subscribe();
    // 'subscribed' / 'denied' both end the conversation; 'error' we just close for now and
    // re-ask next session. In every case the modal closes.
    if (result === 'error') dismissForSession();
    setIsOpen(false);
  }

  function handleLater() {
    dismissForSession();
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

        <div className={styles.bellWrap} aria-hidden="true">
          <Bell size={32} />
        </div>

        <h2 id="notif-modal-title" className={styles.title}>
          منوی روزانه رو از دست نده 🔔
        </h2>
        <p className={styles.body}>
          هر روز بهت خبر می‌دیم چی روی منوئه — قبل از اینکه تموم بشه سفارشت رو ثبت کن!
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
          <button type="button" className={styles.snoozeBtn} onClick={handleLater}>
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
}
