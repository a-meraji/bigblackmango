import type { ServiceItem } from '@types/party-service';
import styles from './ServiceItemChips.module.css';

interface Props {
  items: ServiceItem[];
}

export default function ServiceItemChips({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.list} aria-label="خدمات شامل">
      {items.map((item) => (
        <li key={item.title} className={styles.chip}>
          <span className={styles.chipTitle}>{item.title}</span>
          {item.description && <span className={styles.chipDesc}>{item.description}</span>}
        </li>
      ))}
    </ul>
  );
}
