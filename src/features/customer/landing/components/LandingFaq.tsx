import { useEffect, useState } from 'react';
import type { FaqItem } from '@t/party-service';
import { usePwaInstall } from '@hooks/usePwaInstall';
import ServiceFaq from '@features/customer/party-service/components/ServiceFaq';
import IosInstallInstructions from './IosInstallInstructions';
import styles from './LandingFaq.module.css';

interface Props {
  faq: FaqItem[];
}

export default function LandingFaq({ faq }: Props) {
  const { isIos } = usePwaInstall();
  const [showIosBlock, setShowIosBlock] = useState(isIos);

  useEffect(() => {
    setShowIosBlock(isIos);
  }, [isIos]);

  if (faq.length === 0) return null;

  return (
    <section id="landing-faq" className={styles.section}>
      <ServiceFaq faq={faq} />
      {showIosBlock && <IosInstallInstructions id="install-ios" />}
    </section>
  );
}
