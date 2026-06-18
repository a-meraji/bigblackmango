import { useEffect, useState } from 'react';
import { X, Download, Bell, Zap, Smartphone } from 'lucide-react';
import { usePwaInstall, isIosSafari, isInStandaloneMode } from '@hooks/usePwaInstall';
import { useIsLandingPage, useIsAdminRoute } from '@hooks/useIsLandingPage';
import styles from './PwaInstallModal.module.css';

const DISMISS_KEY = 'bbm_install_modal_dismissed';

export default function PwaInstallModal() {
  const isLandingPage = useIsLandingPage();
  const isAdminRoute = useIsAdminRoute();
  const { isInstallable, triggerInstall, isIos } = usePwaInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isLandingPage || isAdminRoute) return;
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Show on iOS Safari even without beforeinstallprompt
    const shouldShow = isInstallable || isIosSafari();
    if (!shouldShow) return;

    const t = setTimeout(() => setIsOpen(true), 1800);
    return () => clearTimeout(t);
  }, [isInstallable, isLandingPage, isAdminRoute]);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setIsOpen(false);
  }

  async function handleInstall() {
    if (isIos) {
      // iOS: user has to do it manually, just dismiss after showing instructions
      return;
    }
    setInstalling(true);
    const outcome = await triggerInstall();
    setInstalling(false);
    if (outcome === 'accepted' || outcome === 'unavailable') {
      localStorage.setItem(DISMISS_KEY, '1');
      setIsOpen(false);
    }
  }

  if (!isOpen || isLandingPage || isAdminRoute) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      <div className={styles.sheet}>
        <button type="button" className={styles.closeBtn} onClick={handleDismiss} aria-label="بستن">
          <X size={18} />
        </button>

        <div className={styles.iconWrap} aria-hidden="true">
          <img src="/icons/icon-192.png" alt="" className={styles.appIcon} />
        </div>

        <h2 id="pwa-modal-title" className={styles.title}>
          بلک منگو رو نصب کن 🥭
        </h2>

        <p className={styles.subtitle}>هر روز صبح منوی ناهار رو مستقیم روی گوشیت دریافت کن</p>

        <ul className={styles.benefits} aria-label="مزایای نصب">
          <li>
            <Bell size={16} aria-hidden="true" />
            <span>نوتیف روزانه منوی غذا ساعت ۱۰:۳۰</span>
          </li>
          <li>
            <Zap size={16} aria-hidden="true" />
            <span>باز شدن فوری مثل اپ اصلی</span>
          </li>
          <li>
            <Smartphone size={16} aria-hidden="true" />
            <span>بدون نیاز به فضای اضافه</span>
          </li>
        </ul>

        {isIos ? (
          <div className={styles.iosInstructions}>
            <p className={styles.iosTitle}>برای نصب روی iPhone:</p>
            <ol className={styles.iosList}>
              <li>
                دکمه‌ی <strong>اشتراک‌گذاری</strong> (
                <span className={styles.iosShareIcon} aria-label="آیکون اشتراک‌گذاری">
                  ⎙
                </span>
                ) را بزن
              </li>
              <li>
                گزینه‌ی <strong>«افزودن به صفحه اصلی»</strong> را انتخاب کن
              </li>
              <li>روی «افزودن» بزن — تمام!</li>
            </ol>
            <button type="button" className={styles.dismissText} onClick={handleDismiss}>
              فهمیدم، بستن
            </button>
          </div>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.installBtn}
              onClick={handleInstall}
              disabled={installing}
              aria-busy={installing}
            >
              <Download size={18} aria-hidden="true" />
              {installing ? 'در حال نصب...' : 'نصب رایگان اپ'}
            </button>
            <button type="button" className={styles.dismissText} onClick={handleDismiss}>
              نه ممنون
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
