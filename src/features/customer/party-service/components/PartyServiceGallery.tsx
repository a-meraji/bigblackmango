import { useState } from 'react';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './PartyServiceGallery.module.css';

interface Props {
  gallery: string[];
  title: string;
}

export default function PartyServiceGallery({ gallery, title }: Props) {
  const [current, setCurrent] = useState(0);

  if (gallery.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-label="گالری تصاویر">
      <div className={styles.mainSlide}>
        <img
          src={resolveMediaUrl(gallery[current])}
          alt={`${title} — تصویر ${current + 1}`}
          className={styles.mainImage}
        />
      </div>
      {gallery.length > 1 && (
        <div className={styles.thumbRow}>
          {gallery.map((url, i) => (
            <button
              key={url}
              type="button"
              className={`${styles.thumb} ${i === current ? styles.active : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`تصویر ${i + 1}`}
              aria-current={i === current}
            >
              <img src={resolveMediaUrl(url)} alt="" className={styles.thumbImg} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
