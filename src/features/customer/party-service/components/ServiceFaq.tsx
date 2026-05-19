import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@types/party-service';
import Icon from '@components/icon/Icon';
import styles from './ServiceFaq.module.css';

interface Props {
  faq: FaqItem[];
}

export default function ServiceFaq({ faq }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>سوالات متداول</h2>
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
