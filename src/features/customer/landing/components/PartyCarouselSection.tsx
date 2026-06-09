import type { PartyServiceBannerSummary } from '@t/home';
import type { LandingPartySection } from '@t/landing';
import BannerCarousel from '@features/customer/home/components/BannerCarousel';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './PartyCarouselSection.module.css';

interface Props {
  config: LandingPartySection;
  banners: PartyServiceBannerSummary[];
  loading?: boolean;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
}

export default function PartyCarouselSection({
  config,
  banners,
  loading = false,
  onInstallClick,
}: Props) {
  if (!loading && banners.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="party-carousel-title">
      <LandingSectionHeader id="party-carousel-title" title={config.title} />
      <p className={styles.caption}>{config.caption}</p>
      <BannerCarousel
        banners={banners}
        loading={loading}
        mode="install"
        onInstallClick={() => onInstallClick('party_carousel')}
      />
    </section>
  );
}
