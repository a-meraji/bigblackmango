import styles from './IosInstallInstructions.module.css';

interface Props {
  id?: string;
  compact?: boolean;
}

export default function IosInstallInstructions({ id = 'install-ios', compact = false }: Props) {
  return (
    <div id={id} className={compact ? styles.compact : styles.block}>
      {!compact && <p className={styles.title}>برای نصب روی iPhone:</p>}
      <ol className={styles.list}>
        <li>
          دکمه اشتراک‌گذاری (
          <span className={styles.shareIcon} aria-label="آیکون اشتراک‌گذاری">⎙</span>
          ) را بزن
        </li>
        <li>گزینه «افزودن به صفحه اصلی» را انتخاب کن</li>
        <li>روی «افزودن» بزن — تمام!</li>
      </ol>
    </div>
  );
}
