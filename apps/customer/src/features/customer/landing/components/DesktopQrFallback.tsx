import styles from './DesktopQrFallback.module.css';

function isMobileUserAgent() {
  return /iphone|ipad|ipod|android/i.test(window.navigator.userAgent);
}

export default function DesktopQrFallback() {
  if (isMobileUserAgent()) return null;

  const url = window.location.origin;

  return (
    <div className={styles.wrap}>
      <p className={styles.text}>برای سفارش، اپ را روی گوشی نصب کن:</p>
      <code className={styles.url}>{url}</code>
    </div>
  );
}
