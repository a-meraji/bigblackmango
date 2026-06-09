import type { LandingValueProps } from '@t/landing';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './ValuePropsRow.module.css';

interface Props {
  config: LandingValueProps;
}

export default function ValuePropsRow({ config }: Props) {
  if (config.items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="value-props-title">
      <LandingSectionHeader id="value-props-title" title={config.sectionTitle} />
      <ul className={styles.list}>
        {config.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className={styles.card} style={{ transitionDelay: `${index * 80}ms` }}>
            <span className={styles.iconWrap}>
              <LucideIcon name={item.icon} size={16} />
            </span>
            <div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.body}>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
