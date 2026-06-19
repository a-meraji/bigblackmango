import type { LandingSocialStrip } from '@t/landing';
import styles from './SocialProofStrip.module.css';

interface Props {
  socialStrip: LandingSocialStrip;
}

export default function SocialProofStrip({ socialStrip }: Props) {
  if (socialStrip.items.length === 0) return null;

  return (
    <div className={styles.strip} aria-label="اعتماد مشتریان">
      {socialStrip.items.map((item) => (
        <span key={item} className={styles.item}>{item}</span>
      ))}
    </div>
  );
}
