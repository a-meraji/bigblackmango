import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { WifiOff } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import EmptyState from '@components/empty-state/EmptyState';
import { useLandingData } from '@features/customer/landing/hooks/useLandingData';
import { useLandingInstall } from '@features/customer/landing/hooks/useLandingInstall';
import { useLandingState } from '@features/customer/landing/hooks/useLandingState';
import { mergeLandingWithFallback } from '@features/customer/landing/landing-fallbacks';
import { trackLandingEvent } from '@features/customer/landing/track-landing-event';
import LandingHero from '@features/customer/landing/components/LandingHero';
import SocialProofStrip from '@features/customer/landing/components/SocialProofStrip';
import ValuePropsRow from '@features/customer/landing/components/ValuePropsRow';
import RevealSection from '@features/customer/landing/components/RevealSection';
import InstallCta from '@features/customer/landing/components/InstallCta';
import LandingFooter from '@features/customer/landing/components/LandingFooter';
import SectionSkeleton from '@features/customer/landing/components/SectionSkeleton';
import styles from '@features/customer/landing/LandingHomePage.module.css';

const FoodShowcaseSection = lazy(
  () => import('@features/customer/landing/components/FoodShowcaseSection'),
);
const TrustStatsSection = lazy(
  () => import('@features/customer/landing/components/TrustStatsSection'),
);
const PartyCarouselSection = lazy(
  () => import('@features/customer/landing/components/PartyCarouselSection'),
);
const HowItWorks = lazy(() => import('@features/customer/landing/components/HowItWorks'));
const TestimonialsSection = lazy(
  () => import('@features/customer/landing/components/TestimonialsSection'),
);
const LandingFaq = lazy(() => import('@features/customer/landing/components/LandingFaq'));
const FinalCtaBand = lazy(() => import('@features/customer/landing/components/FinalCtaBand'));

export default function LandingHomePage() {
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, refetch } = useLandingData();
  const landing = mergeLandingWithFallback(data);
  const { handleInstallClick } = useLandingInstall();
  const { showSticky } = useLandingState(heroSentinelRef);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    trackLandingEvent('landing_view');
  }, []);

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  async function onInstallClick(sectionId: string) {
    setInstalling(true);
    try {
      await handleInstallClick(sectionId);
    } finally {
      setInstalling(false);
    }
  }

  if (isError && !data) {
    return (
      <PageShell narrow className={styles.page}>
        <EmptyState
          icon={WifiOff}
          title="بارگذاری صفحه ناموفق بود"
          description="اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
          actionLabel="تلاش مجدد"
          onAction={() => refetch()}
        />
        <ValuePropsRow config={landing.valueProps} />
        <RevealSection className={styles.section}>
          <Suspense fallback={<SectionSkeleton />}>
            <LandingFaq faq={landing.faq} />
          </Suspense>
        </RevealSection>
        <LandingFooter content={landing.footer} />
      </PageShell>
    );
  }

  return (
    <PageShell narrow className={styles.page}>
      <LandingHero
        hero={landing.hero}
        onInstallClick={onInstallClick}
        installing={installing}
      />
      <div ref={heroSentinelRef} aria-hidden="true" />

      <RevealSection className={styles.sectionTight}>
        <SocialProofStrip socialStrip={landing.socialStrip} />
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <FoodShowcaseSection
            config={landing.foodShowcase}
            foods={landing.featuredFoods}
            loading={isLoading}
            onInstallClick={onInstallClick}
            installing={installing}
          />
        </Suspense>
      </RevealSection>

      <RevealSection className={styles.section}>
        <ValuePropsRow config={landing.valueProps} />
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <TrustStatsSection
            sectionTitle={landing.trustSectionTitle}
            stats={landing.stats}
          />
        </Suspense>
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorks config={landing.howItWorks} />
        </Suspense>
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <PartyCarouselSection
            config={landing.partySection}
            banners={landing.partyServiceBanners}
            loading={isLoading}
            onInstallClick={onInstallClick}
          />
        </Suspense>
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection
            sectionTitle={landing.testimonialsSectionTitle}
            testimonials={landing.testimonials}
          />
        </Suspense>
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <LandingFaq faq={landing.faq} />
        </Suspense>
      </RevealSection>

      <RevealSection className={styles.section}>
        <Suspense fallback={<SectionSkeleton />}>
          <FinalCtaBand
            config={landing.finalCta}
            onInstallClick={onInstallClick}
            installing={installing}
          />
        </Suspense>
      </RevealSection>

      <LandingFooter content={landing.footer} />

      <div className={styles.stickySpacer} aria-hidden="true" />
      <InstallCta
        visible={showSticky}
        onInstallClick={onInstallClick}
        installing={installing}
      />
    </PageShell>
  );
}
