import { Download } from 'lucide-react';
import clsx from 'clsx';
import Icon from '@components/icon/Icon';
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
  label = 'ورود به برنامه',
  sectionId,
  onClick,
  loading = false,
  fullWidth = false,
  className,
}: Props) {
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
