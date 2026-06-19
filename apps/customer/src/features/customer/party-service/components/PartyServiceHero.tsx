import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './PartyServiceHero.module.css';

interface Props {
  title: string;
  heroImageUrl: string | null;
  summary: string | null;
}

export default function PartyServiceHero({ title, heroImageUrl, summary }: Props) {
  return (
    <header className={styles.hero}>
      {heroImageUrl ? (
        <img src={resolveMediaUrl(heroImageUrl)} alt={title} className={styles.image} />
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}

      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {summary && <p className={styles.summary}>{summary}</p>}
        </div>
        <div className={styles.vipBadge} aria-hidden="true">
          سفارش VIP
        </div>
      </div>
    </header>
  );
}
