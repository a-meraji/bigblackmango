import { useParams, useNavigate } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import PageShell from '@components/page-shell/PageShell';
import BackButton from '@components/back-button/BackButton';
import EmptyState from '@components/empty-state/EmptyState';
import { usePartyService } from '@features/customer/party-service/hooks/usePartyService';
import PartyServiceHero from '@features/customer/party-service/components/PartyServiceHero';
import PartyServiceGallery from '@features/customer/party-service/components/PartyServiceGallery';
import ServiceItemChips from '@features/customer/party-service/components/ServiceItemChips';
import ServiceFaq from '@features/customer/party-service/components/ServiceFaq';
import ContactCta from '@features/customer/party-service/components/ContactCta';
import Spinner from '@components/spinner/Spinner';
import styles from './PartyServicePage.module.css';

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
      <BackButton />
      <PartyServiceHero
        title={service.title}
        heroImageUrl={service.heroImageUrl}
        summary={service.summary}
      />
      <PartyServiceGallery gallery={service.gallery} title={service.title} />

      <div className={styles.content}>
        {service.description && <p className={styles.description}>{service.description}</p>}
        <ServiceItemChips items={service.serviceItems} />
      </div>

      {service.faq.length > 0 && <ServiceFaq faq={service.faq} />}

      <ContactCta phone={service.contactPhone} serviceTitle={service.title} />
    </PageShell>
  );
}
