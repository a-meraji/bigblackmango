import InstallButton from './InstallButton';
import ContinueOnWebButton from './ContinueOnWebButton';
import styles from './InstallCta.module.css';

interface Props {
  visible: boolean;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
  onContinueWeb: (sectionId: string) => void;
  installing?: boolean;
}

export default function InstallCta({ visible, onInstallClick, onContinueWeb, installing }: Props) {
  if (!visible) return null;

  return (
    <div className={styles.bar} role="complementary" aria-label="نصب اپ">
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.label}>اپ بلک منگو</span>
          <span className={styles.sub}>نصب رایگان · سفارش سریع</span>
        </div>
        <InstallButton
          label="ورود به برنامه"
          sectionId="sticky"
          onClick={onInstallClick}
          loading={installing}
        />
        <ContinueOnWebButton label="ادامه در وب" onClick={() => onContinueWeb('sticky')} />
      </div>
    </div>
  );
}
