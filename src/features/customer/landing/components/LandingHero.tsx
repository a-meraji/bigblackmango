import type { LandingHero as LandingHeroType } from '@t/landing';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import InstallButton from './InstallButton';
import styles from './LandingHero.module.css';

interface Props {
  hero: LandingHeroType;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
  installing?: boolean;
}

export default function LandingHero({ hero, onInstallClick, installing }: Props) {
  return (
    <section className={styles.hero} aria-labelledby="landing-hero-title">
      {hero.imageUrl && (
        <div className={styles.imageFrame}>
          <img
            src={resolveMediaUrl(hero.imageUrl)}
            alt={hero.imageAlt ?? hero.title}
            className={styles.image}
            loading="eager"
          />
        </div>
      )}

      <div className={styles.content}>
        <span className={styles.badge}>{hero.badge}</span>
        <h1 id="landing-hero-title" className={styles.title}>
          {hero.title}
        </h1>
        {hero.subtitle && <p className={styles.subtitle}>{hero.subtitle}</p>}
        <InstallButton
          sectionId="hero"
          onClick={onInstallClick}
          loading={installing}
          fullWidth
        />
        <p className={styles.trustLine}>{hero.trustLine}</p>
      </div>
    </section>
  );
}
