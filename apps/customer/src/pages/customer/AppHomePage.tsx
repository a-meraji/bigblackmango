import { useNavigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import Section from '@components/section/Section';
import EmptyState from '@components/empty-state/EmptyState';
import StoriesRow from '@features/customer/home/components/StoriesRow';
import BannerCarousel from '@features/customer/home/components/BannerCarousel';
import CategoryGrid from '@features/customer/home/components/CategoryGrid';
import { useHomeData } from '@features/customer/home/hooks/useHomeData';
import styles from './HomePage.module.css';

export default function AppHomePage() {
  const { data: home, isLoading: homeLoading, isError, refetch } = useHomeData();
  const navigate = useNavigate();

  const stories = home?.stories ?? [];
  const partyBanners = home?.partyServiceBanners ?? [];
  const showStories = homeLoading || stories.length > 0;
  const showPartyBanners = homeLoading || partyBanners.length > 0;

  function handleCategorySelect(id: string | undefined) {
    navigate(id ? `/menu?categoryId=${id}` : '/menu');
  }

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
          <Section title={stories.length > 0 ? 'استوری‌ها' : undefined}>
            <StoriesRow stories={stories} loading={homeLoading} />
          </Section>
        )}

        {showPartyBanners && (
          <Section title={partyBanners.length > 0 ? 'پذیرایی و مجالس' : undefined}>
            <BannerCarousel banners={partyBanners} loading={homeLoading} />
          </Section>
        )}

        <Section title="دسته‌بندی‌ها">
          <CategoryGrid
            categories={home?.categories ?? []}
            activeId={undefined}
            onSelect={handleCategorySelect}
            loading={homeLoading}
          />
        </Section>
      </div>
    </PageShell>
  );
}
