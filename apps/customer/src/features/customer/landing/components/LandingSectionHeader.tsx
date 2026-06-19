import type { LucideIcon } from 'lucide-react';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import Icon from '@components/icon/Icon';
import styles from './LandingSectionHeader.module.css';

interface Props {
  title: string;
  icon?: LucideIcon;
  iconName?: string | null;
  id?: string;
}

export default function LandingSectionHeader({ title, icon, iconName, id }: Props) {
  return (
    <div className={styles.header}>
      {icon && (
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon icon={icon} size="sm" decorative />
        </span>
      )}
      {!icon && iconName && (
        <span className={styles.iconWrap} aria-hidden="true">
          <LucideIcon name={iconName} size={16} />
        </span>
      )}
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
    </div>
  );
}
