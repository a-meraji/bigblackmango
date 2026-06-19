import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import Icon from '@components/icon/Icon';
import styles from './ContinueOnWebButton.module.css';

interface Props {
  label?: string;
  onClick: () => void;
  fullWidth?: boolean;
  className?: string;
}

export default function ContinueOnWebButton({
  label = 'ادامه در وب بدون نصب',
  onClick,
  fullWidth = false,
  className,
}: Props) {
  return (
    <button
      type="button"
      className={clsx(styles.button, fullWidth && styles.fullWidth, className)}
      onClick={onClick}
    >
      {label}
      {/* RTL: ArrowLeft visually points "forward" / into the app. */}
      <Icon icon={ArrowLeft} size="sm" decorative />
    </button>
  );
}
