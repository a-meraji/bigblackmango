import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import Icon from '@components/icon/Icon';
import styles from './IconButton.module.css';

type IconButtonVariant = 'ghost' | 'secondary';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: IconButtonVariant;
  size?: 'md' | 'lg';
}

export default function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.btn, styles[variant], styles[size], className)}
      aria-label={label}
      {...rest}
    >
      <Icon icon={icon} size={size === 'lg' ? 'lg' : 'md'} decorative />
    </button>
  );
}
