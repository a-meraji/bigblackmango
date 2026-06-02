import { Star } from 'lucide-react';
import type { ServiceTestimonial } from '@t/party-service';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './TestimonialsRow.module.css';

interface Props {
  testimonials: ServiceTestimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`امتیاز: ${rating} از ۵`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function TestimonialsRow({ testimonials }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <div className={styles.scrollWrap}>
      <ul className={styles.list} aria-label="نظرات مشتریان">
        {testimonials.map((t) => (
          <li key={t.id} className={styles.card}>
            <StarRating rating={t.rating} />
            <blockquote className={styles.quote}>
              <p className={styles.text}>«{t.text}»</p>
            </blockquote>
            <div className={styles.author}>
              {t.avatarUrl ? (
                <img
                  src={resolveMediaUrl(t.avatarUrl)}
                  alt=""
                  className={styles.avatar}
                  loading="lazy"
                />
              ) : (
                <div className={styles.avatarPlaceholder} aria-hidden="true">
                  {t.authorName.charAt(0)}
                </div>
              )}
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{t.authorName}</span>
                {t.role && <span className={styles.role}>{t.role}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
