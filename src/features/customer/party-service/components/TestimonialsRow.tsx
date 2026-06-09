import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import type { ServiceTestimonial } from '@t/party-service';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './TestimonialsRow.module.css';

interface Props {
  testimonials: ServiceTestimonial[];
  autoScroll?: boolean;
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

function scrollItemIntoHorizontalView(
  list: HTMLElement,
  item: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
) {
  const listRect = list.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  if (itemRect.left < listRect.left) {
    list.scrollBy({ left: itemRect.left - listRect.left, behavior });
  } else if (itemRect.right > listRect.right) {
    list.scrollBy({ left: itemRect.right - listRect.right, behavior });
  }
}

export default function TestimonialsRow({ testimonials, autoScroll = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoScroll || testimonials.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, [autoScroll, testimonials.length]);

  useEffect(() => {
    if (!autoScroll || testimonials.length <= 1) return;

    const list = listRef.current;
    const item = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !item) return;

    // Scroll the horizontal list only — never scroll the page vertically.
    scrollItemIntoHorizontalView(list, item);
  }, [activeIndex, autoScroll, testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <div ref={scrollRef} className={styles.scrollWrap}>
      <ul ref={listRef} className={styles.list} aria-label="نظرات مشتریان">
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
