import { Utensils, Music, Sparkles, Camera, Gift, Heart, Users, Star } from 'lucide-react';
import type { ServiceItem } from '@t/party-service';
import styles from './ServiceItemChips.module.css';

const ICONS = [Utensils, Music, Sparkles, Camera, Gift, Heart, Users, Star] as const;

interface Props {
  items: ServiceItem[];
}

export default function ServiceItemChips({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.grid} aria-label="خدمات شامل">
      {items.map((item, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <li key={item.title} className={styles.card}>
            <div className={styles.iconWrap} aria-hidden="true">
              <Icon size={18} />
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>{item.title}</span>
              {item.description && (
                <span className={styles.cardDesc}>{item.description}</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
