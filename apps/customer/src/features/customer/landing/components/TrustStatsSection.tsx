import type { ServiceStat } from '@t/party-service';
import ServiceStatsRow from '@features/customer/party-service/components/ServiceStatsRow';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './TrustStatsSection.module.css';

interface Props {
  sectionTitle: string;
  stats: ServiceStat[];
}

export default function TrustStatsSection({ sectionTitle, stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <LandingSectionHeader title={sectionTitle} />
      </div>
      <ServiceStatsRow stats={stats} />
    </section>
  );
}
