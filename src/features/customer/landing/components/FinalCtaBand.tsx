import type { LandingFinalCta } from '@t/landing';
import { usePwaInstall } from '@hooks/usePwaInstall';
import InstallButton from './InstallButton';
import StoreBadgeRow from './StoreBadgeRow';
import TrustReassuranceList from './TrustReassuranceList';
import IosInstallInstructions from './IosInstallInstructions';
import DesktopQrFallback from './DesktopQrFallback';
import styles from './FinalCtaBand.module.css';

interface Props {
  config: LandingFinalCta;
  onInstallClick: (sectionId: string) => void | Promise<unknown>;
  installing?: boolean;
}

export default function FinalCtaBand({ config, onInstallClick, installing }: Props) {
  const { isIos, isInstallable } = usePwaInstall();

  return (
    <section id="section-final-cta" className={styles.section} aria-labelledby="final-cta-title">
      <h2 id="final-cta-title" className={styles.title}>{config.title}</h2>
      <p className={styles.subtitle}>{config.subtitle}</p>
      <InstallButton
        sectionId="final"
        onClick={onInstallClick}
        loading={installing}
        fullWidth
      />
      <StoreBadgeRow />
      <TrustReassuranceList items={config.trustItems} />
      {config.links.length > 0 && (
        <nav className={styles.links} aria-label="لینک‌های مرتبط">
          {config.links.map((link) => (
            <a key={`${link.href}-${link.label}`} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>
      )}
      {isIos && <IosInstallInstructions compact />}
      {!isInstallable && !isIos && <DesktopQrFallback />}
    </section>
  );
}
