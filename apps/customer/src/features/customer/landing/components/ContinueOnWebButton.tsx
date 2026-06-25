import { UtensilsCrossed } from 'lucide-react';
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
  label = 'مشاهده منو',
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
      <Icon icon={UtensilsCrossed} size="sm" decorative />
      {label}
    </button>
  );
}
