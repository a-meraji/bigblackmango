import type { ServiceItem } from '@t/party-service';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  item: ServiceItem;
}

export default function ServiceCard({ item }: ServiceCardProps) {
  const coverUrl = item.gallery[0] ?? null;

  return (
    <article className={styles.card}>
      {/* Image — 40% on the start side (physically right in RTL) */}
      {coverUrl ? (
        <div className={styles.imageWrap}>
          <img
            src={resolveMediaUrl(coverUrl)}
            alt={item.title}
            className={styles.image}
            loading="lazy"
          />
        </div>
      ) : (
        <div className={styles.imagePlaceholder} aria-hidden="true" />
      )}

      {/* Text — fills the end side (physically left in RTL) */}
      <div className={styles.body}>
        <h3 className={styles.title}>{item.title}</h3>

        {item.features.length > 0 && (
          <ul className={styles.badges} aria-label="ویژگی‌ها">
            {item.features.map((feat, i) => (
              <li key={i} className={styles.badge}>
                {feat}
              </li>
            ))}
          </ul>
        )}

        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
      </div>
    </article>
  );
}
