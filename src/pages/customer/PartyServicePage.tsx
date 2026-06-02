import { useParams, useNavigate } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import BackButton from '@components/back-button/BackButton';
import EmptyState from '@components/empty-state/EmptyState';
import { usePartyService } from '@features/customer/party-service/hooks/usePartyService';
import HighlightsRow from '@features/customer/party-service/components/HighlightsRow';
import PartyServiceHero from '@features/customer/party-service/components/PartyServiceHero';
import ServiceStatsRow from '@features/customer/party-service/components/ServiceStatsRow';
import ServiceCard from '@features/customer/party-service/components/ServiceCard';
import PartyServiceGallery from '@features/customer/party-service/components/PartyServiceGallery';
import TestimonialsRow from '@features/customer/party-service/components/TestimonialsRow';
import ServiceFaq from '@features/customer/party-service/components/ServiceFaq';
import ContactCta from '@features/customer/party-service/components/ContactCta';
import Spinner from '@components/spinner/Spinner';
import { useRevealOnScroll } from '@hooks/useRevealOnScroll';
import styles from './PartyServicePage.module.css';

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ''}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionSparkle} aria-hidden="true">✦</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
  );
}

export default function PartyServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { data: service, isLoading, isError } = usePartyService(serviceId ?? '');

  if (isLoading) {
    return (
      <PageShell withCartInset className={styles.loadingWrap}>
        <Spinner size="lg" label="در حال بارگذاری" />
      </PageShell>
    );
  }

  if (isError || !service) {
    return (
      <PageShell withCartInset>
        <EmptyState
          icon={PartyPopper}
          title="سرویس یافت نشد"
          actionLabel="بازگشت"
          onAction={() => navigate(-1)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell withCartInset narrow className={styles.page}>
      <div className={styles.backButtonWrap}>
        <BackButton />
      </div>

      {/* 1. Hero — rounded banner card with centered title + VIP badge */}
      <PartyServiceHero
        title={service.title}
        heroImageUrl={service.heroImageUrl}
        summary={service.summary}
      />

      {/* 2. Highlights (Instagram stories row) */}
      <HighlightsRow highlights={service.highlights} />

      {/* 3. Stats strip — animated counters */}
      <ServiceStatsRow stats={service.stats} />

      {/* 4. Services section */}
      {service.serviceItems.length > 0 && (
        <RevealSection className={styles.section}>
          <SectionHeader title="خدمات ما" />
          <div className={styles.serviceCards}>
            {service.serviceItems.map((item) => (
              <RevealSection key={item.id}>
                <ServiceCard item={item} />
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      )}

      {/* 5. About card — informational card with decorative grid */}
      {service.description && (
        <RevealSection className={styles.section}>
          <div className={styles.aboutCard}>
            <div className={styles.aboutDecor} aria-hidden="true">
              <div className={styles.decorGrid}>
                <span className={styles.decorCell} />
                <span className={styles.decorCell} />
                <span className={styles.decorCell} />
                <span className={styles.decorCell} />
              </div>
            </div>
            <div className={styles.aboutContent}>
              <h2 className={styles.aboutTitle}>درباره این سرویس</h2>
              <p className={styles.aboutText}>{service.description}</p>
            </div>
          </div>
        </RevealSection>
      )}

      {/* 6. Gallery — 3-panel peek carousel */}
      {service.gallery.length > 0 && (
        <RevealSection className={styles.section}>
          <SectionHeader title="گالری تصاویر" />
          <PartyServiceGallery gallery={service.gallery} title={service.title} />
        </RevealSection>
      )}

      {/* 7. Testimonials — horizontal scroll cards */}
      {service.testimonials.length > 0 && (
        <RevealSection className={styles.section}>
          <SectionHeader title="نظرات مشتریان" />
          <TestimonialsRow testimonials={service.testimonials} />
        </RevealSection>
      )}

      {/* 8. FAQ */}
      {service.faq.length > 0 && (
        <RevealSection className={`${styles.section} ${styles.sectionBeforeCta}`}>
          <ServiceFaq faq={service.faq} />
        </RevealSection>
      )}

      {/* 9. Sticky CTA */}
      <ContactCta phone={service.contactPhone} serviceTitle={service.title} />
    </PageShell>
  );
}
