import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './PartyServiceGallery.module.css';

interface Props {
  gallery: string[];
  title: string;
}

export default function PartyServiceGallery({ gallery, title }: Props) {
  const count = gallery.length;
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSlide = useCallback((index: number) => {
    slideRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % count) + count) % count;
      setCurrent(next);
      scrollToSlide(next);
    },
    [count, scrollToSlide],
  );

  /* Sync dot indicator to whichever slide scrolls into center */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.55) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setCurrent(idx);
          }
        }
      },
      { root: track, threshold: 0.55 },
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  if (count === 0) return null;

  return (
    <div className={styles.wrapper}>
      {/* ── Scrollable peek strip ── */}
      <div className={styles.track} ref={trackRef}>
        {gallery.map((url, i) => (
          <div
            key={url}
            ref={(el) => { slideRefs.current[i] = el; }}
            className={styles.slide}
            onClick={() => goTo(i)}
          >
            <img
              src={resolveMediaUrl(url)}
              alt={i === current ? `${title} — تصویر ${i + 1}` : ''}
              className={styles.slideImg}
              loading={i === 0 ? 'eager' : 'lazy'}
              aria-hidden={i !== current ? true : undefined}
            />
          </div>
        ))}
      </div>

      {/* ── Prev / Next arrows ── */}
      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => goTo(current - 1)}
            aria-label="تصویر قبلی"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => goTo(current + 1)}
            aria-label="تصویر بعدی"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label="انتخاب تصویر">
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`تصویر ${i + 1}`}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
