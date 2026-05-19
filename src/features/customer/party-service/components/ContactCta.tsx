import { Phone } from 'lucide-react';
import Icon from '@components/icon/Icon';
import styles from './ContactCta.module.css';

interface Props {
  phone: string | null;
  serviceTitle: string;
}

export default function ContactCta({ phone, serviceTitle }: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.label}>برای رزرو و استعلام قیمت</span>
          <span className={styles.sub}>{serviceTitle}</span>
        </div>
        {phone ? (
          <a href={`tel:${phone}`} className={styles.callBtn} aria-label={`تماس برای ${serviceTitle}`}>
            <Icon icon={Phone} size="sm" decorative />
            تماس با ما
          </a>
        ) : (
          <span className={styles.noPhone}>شماره تماس ثبت نشده</span>
        )}
      </div>
    </div>
  );
}
