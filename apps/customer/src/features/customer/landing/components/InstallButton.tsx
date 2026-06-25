import { Download } from 'lucide-react';
import clsx from 'clsx';
import Icon from '@components/icon/Icon';
import { usePwaInstall } from '@hooks/usePwaInstall';
import styles from './InstallButton.module.css';

interface Props {
  label?: string;
  sectionId: string;
  onClick: (sectionId: string) => void | Promise<unknown>;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function InstallButton({
  label = 'نصب برنامه',
  sectionId,
  onClick,
  loading = false,
  fullWidth = false,
  className,
}: Props) {
  const { isInstallReady } = usePwaInstall();
  // Don't render the install button at all while the app is still getting ready — only show it
  // once it's actually installable, so the user never sees a button they can't use yet.
  if (!isInstallReady) return null;

  return (
    <button
      type="button"
      className={clsx(styles.button, fullWidth && styles.fullWidth, className)}
      onClick={() => onClick(sectionId)}
      disabled={loading}
      aria-busy={loading}
      aria-label={label}
    >
      <Icon icon={Download} size="sm" decorative />
      {loading ? 'در حال نصب...' : label}
    </button>
  );
}
