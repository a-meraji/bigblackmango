import { useState } from 'react';
import { WifiOff } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import Section from '@components/section/Section';
import EmptyState from '@components/empty-state/EmptyState';
import StoriesRow from '@features/customer/home/components/StoriesRow';
import BannerCarousel from '@features/customer/home/components/BannerCarousel';
import CategoryFilter from '@features/customer/home/components/CategoryFilter';
import FoodGrid from '@features/customer/home/components/FoodGrid';
import { useHomeData } from '@features/customer/home/hooks/useHomeData';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { data: home, isLoading: homeLoading, isError, refetch } = useHomeData();
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);

  const stories = home?.stories ?? [];
  const partyBanners = home?.partyServiceBanners ?? [];
  const showStories = homeLoading || stories.length > 0;
  const showPartyBanners = homeLoading || partyBanners.length > 0;

  if (isError && !home) {
    return (
      <PageShell withCartInset narrow className={styles.page}>
        <EmptyState
          icon={WifiOff}
          title="بارگذاری صفحه اصلی ناموفق بود"
          description="اتصال اینترنت را بررسی کنید. نیازی به ورود نیست — فقط دوباره تلاش کنید."
          actionLabel="تلاش مجدد"
          onAction={() => refetch()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell withCartInset narrow className={styles.page}>
      <div className={styles.stack}>
        {showStories && (
          <Section title={stories.length > 0 ? 'استوری‌ها' : undefined} flush>
            <StoriesRow stories={stories} loading={homeLoading} />
          </Section>
        )}

        {showPartyBanners && (
          <Section title={partyBanners.length > 0 ? 'پذیرایی و مجالس' : undefined} flush>
            <BannerCarousel banners={partyBanners} loading={homeLoading} />
          </Section>
        )}

        <Section title="دسته‌بندی" flush>
          <CategoryFilter
            categories={home?.categories ?? []}
            activeId={activeCategoryId}
            onSelect={setActiveCategoryId}
            loading={homeLoading}
          />
        </Section>

        <Section title="منوی امروز" flush>
          <FoodGrid categoryId={activeCategoryId} />
        </Section>
      </div>
    </PageShell>
  );
}
