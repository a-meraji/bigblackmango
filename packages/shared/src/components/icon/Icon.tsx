import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './Icon.module.css';

export type IconSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  /** When true, hidden from assistive tech (decorative). */
  decorative?: boolean;
  label?: string;
}

export default function Icon({
  icon: LucideComponent,
  size = 'md',
  className,
  decorative = true,
  label,
}: IconProps) {
  const px = SIZE_MAP[size];

  return (
    <LucideComponent
      size={px}
      className={clsx(styles.icon, styles[size], className)}
      aria-hidden={decorative && !label ? true : undefined}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
