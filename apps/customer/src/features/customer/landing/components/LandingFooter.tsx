import { Clock, MapPin, Phone } from 'lucide-react';
import Icon from '@components/icon/Icon';
import type { LandingFooterContent } from '@t/landing';
import { formatDigits } from '@utils/locale';
import styles from './LandingFooter.module.css';

interface Props {
  content: LandingFooterContent;
}

export default function LandingFooter({ content }: Props) {
  const { brandName, tagline, phone, address, hours, quickLinks } = content;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <footer className={styles.footer} aria-label="اطلاعات تماس و پاورقی">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            src="/icons/icon-192.png"
            alt=""
            className={styles.logo}
            width={48}
            height={48}
            aria-hidden="true"
          />
          <div>
            <p className={styles.brandName}>{brandName}</p>
            <p className={styles.tagline}>{tagline}</p>
          </div>
        </div>

        <ul className={styles.contactList}>
          <li>
            <a href={`tel:${phone}`} className={styles.contactLink}>
              <Icon icon={Phone} size="sm" decorative />
              <span dir="ltr">{formatDigits(phone)}</span>
            </a>
          </li>
          <li>
            <a
              href={mapsUrl}
              className={styles.contactLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon={MapPin} size="sm" decorative />
              <span>{address}</span>
            </a>
          </li>
          <li className={styles.contactItem}>
            <Icon icon={Clock} size="sm" decorative />
            <span>{hours}</span>
          </li>
        </ul>

        <nav className={styles.quickLinks} aria-label="میانبرهای صفحه">
          {quickLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.quickLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <p className={styles.copyright}>
          © {brandName} · تمامی حقوق محفوظ است
        </p>
      </div>
    </footer>
  );
}
