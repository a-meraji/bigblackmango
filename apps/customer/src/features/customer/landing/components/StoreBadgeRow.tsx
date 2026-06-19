import clsx from 'clsx';
import styles from './StoreBadgeRow.module.css';

const appStoreUrl = import.meta.env.VITE_APP_STORE_URL as string | undefined;
const playStoreUrl = import.meta.env.VITE_PLAY_STORE_URL as string | undefined;

function StoreBadge({
  label,
  href,
  disabled,
}: {
  label: string;
  href?: string;
  disabled: boolean;
}) {
  if (disabled || !href) {
    return (
      <span className={clsx(styles.badge, styles.disabled)} aria-disabled="true" title="به‌زودی">
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={styles.badge}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {label}
    </a>
  );
}

export default function StoreBadgeRow() {
  return (
    <div className={styles.row} aria-label="دانلود از استور">
      <StoreBadge
        label="App Store"
        href={appStoreUrl}
        disabled={!appStoreUrl}
      />
      <StoreBadge
        label="Google Play"
        href={playStoreUrl}
        disabled={!playStoreUrl}
      />
      {!appStoreUrl && !playStoreUrl && (
        <p className={styles.soon}>به‌زودی در استورها</p>
      )}
    </div>
  );
}
