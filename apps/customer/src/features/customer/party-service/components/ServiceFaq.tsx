import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@t/party-service';
import Icon from '@components/icon/Icon';
import styles from './ServiceFaq.module.css';

interface Props {
  faq: FaqItem[];
  sectionTitle?: string;
  className?: string;
}

export default function ServiceFaq({ faq, sectionTitle = 'سوالات متداول', className }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`${styles.section} ${className ?? ''}`.trim()}>
      <div className={styles.header}>
        <span className={styles.headerAccent} aria-hidden="true" />
        <h2 className={styles.title}>{sectionTitle}</h2>
      </div>
      <dl className={styles.list}>
        {faq.map((item, i) => (
          <div key={`${item.question}-${i}`} className={styles.item}>
            <dt>
              <button
                type="button"
                className={styles.question}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                {item.question}
                <span
                  className={`${styles.icon} ${openIndex === i ? styles.open : ''}`}
                  aria-hidden="true"
                >
                  <Icon icon={ChevronDown} size="sm" decorative />
                </span>
              </button>
            </dt>
            {openIndex === i && <dd className={styles.answer}>{item.answer}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
