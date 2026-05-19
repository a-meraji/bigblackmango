import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { PartyServiceBannerSummary } from '@types/home';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './BannerCarousel.module.css';

interface BannerCarouselProps {
  banners: PartyServiceBannerSummary[];
  loading: boolean;
}

const AUTO_ADVANCE_MS = 4000;

export default function BannerCarousel({ banners, loading }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [advance, banners.length]);

  // Reset to 0 when banner list changes
  useEffect(() => {
    setCurrent(0);
  }, [banners.length]);

  if (loading) {
    return <div className={`${styles.wrapper} ${styles.skeleton}`} aria-busy="true" />;
  }

  if (banners.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-label="سرویس‌های کیترینگ و پذیرایی">
      <div
        className={styles.track}
        style={{ transform: `translateX(${current * 100}%)` }}
        aria-live="off"
      >
        {banners.map((banner, i) => (
          <Link
            key={banner.id}
            to={`/party-services/${banner.servicePageId}`}
            className={styles.slide}
            draggable={false}
            aria-hidden={i !== current}
            tabIndex={i !== current ? -1 : 0}
          >
            <img
              src={resolveMediaUrl(banner.imageUrl)}
              alt={banner.title}
              className={styles.image}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className={styles.overlay}>
              <h2 className={styles.title}>{banner.title}</h2>
              {banner.subtitle && <p className={styles.subtitle}>{banner.subtitle}</p>}
            </div>
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <div className={styles.dots} aria-label="موقعیت اسلاید">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`اسلاید ${(i + 1).toLocaleString('fa-IR')}: ${banner.title}`}
              aria-current={i === current}
              type="button"
            />
          ))}
        </div>
      )}
    </section>
  );
}
