import InstallButton from './InstallButton';
import styles from './InstallCta.module.css';

interface Props {
  visible: boolean;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
  installing?: boolean;
}

export default function InstallCta({ visible, onInstallClick, installing }: Props) {
  if (!visible) return null;

  return (
    <div className={styles.bar} role="complementary" aria-label="نصب اپ">
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.label}>اپ بلک منگو</span>
          <span className={styles.sub}>نصب رایگان · سفارش سریع</span>
        </div>
        <InstallButton
          label="نصب بلک منگو"
          sectionId="sticky"
          onClick={onInstallClick}
          loading={installing}
        />
      </div>
    </div>
  );
}
