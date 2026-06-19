import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { PartyServiceBannerSummary } from '@t/home';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './BannerCarousel.module.css';
import { formatNumber } from '@utils/locale';

interface BannerCarouselProps {
  banners: PartyServiceBannerSummary[];
  loading: boolean;
  mode?: 'navigate' | 'install';
  onInstallClick?: () => void;
}

const AUTO_ADVANCE_MS = 4000;

export default function BannerCarousel({
  banners,
  loading,
  mode = 'navigate',
  onInstallClick,
}: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [advance, banners.length]);

  useEffect(() => {
    setCurrent(0);
  }, [banners.length]);

  if (loading) {
    return <div className={`${styles.wrapper} ${styles.skeleton}`} aria-busy="true" />;
  }

  if (banners.length === 0) return null;

  function handleSlideAction() {
    if (mode === 'install') {
      onInstallClick?.();
    }
  }

  return (
    <section className={styles.wrapper} aria-label="سرویس‌های کیترینگ و پذیرایی">
      <div
        className={styles.track}
        style={{ transform: `translateX(${current * 100}%)` }}
        aria-live="off"
      >
        {banners.map((banner, i) => {
          const slideContent = (
            <>
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
            </>
          );

          if (mode === 'install') {
            return (
              <button
                key={banner.id}
                type="button"
                className={`${styles.slide} ${styles.slideButton}`}
                onClick={handleSlideAction}
                aria-hidden={i !== current}
                tabIndex={i !== current ? -1 : 0}
                aria-label={`${banner.title} — نصب برای مشاهده`}
              >
                {slideContent}
              </button>
            );
          }

          return (
            <Link
              key={banner.id}
              to={`/party-services/${banner.servicePageId}`}
              className={styles.slide}
              draggable={false}
              aria-hidden={i !== current}
              tabIndex={i !== current ? -1 : 0}
            >
              {slideContent}
            </Link>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className={styles.dots} aria-label="موقعیت اسلاید">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`اسلاید ${formatNumber(i + 1)}: ${banner.title}`}
              aria-current={i === current}
              type="button"
            />
          ))}
        </div>
      )}
    </section>
  );
}
