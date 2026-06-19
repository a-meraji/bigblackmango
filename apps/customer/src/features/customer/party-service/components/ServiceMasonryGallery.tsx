import { useState } from 'react';
import { X } from 'lucide-react';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './ServiceMasonryGallery.module.css';

interface Props {
  gallery: string[];
  title: string;
}

export default function ServiceMasonryGallery({ gallery, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (gallery.length === 0) return null;

  return (
    <>
      <div className={styles.masonry} aria-label={`گالری ${title}`}>
        {gallery.map((url, i) => (
          <button
            key={url}
            type="button"
            className={styles.tile}
            onClick={() => setLightboxIndex(i)}
            aria-label={`مشاهده تصویر ${i + 1}`}
          >
            <img
              src={resolveMediaUrl(url)}
              alt={`${title} — تصویر ${i + 1}`}
              className={styles.img}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="نمایش تصویر"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setLightboxIndex(null)}
            aria-label="بستن"
          >
            <X size={22} aria-hidden />
          </button>
          <img
            src={resolveMediaUrl(gallery[lightboxIndex])}
            alt={`${title} — تصویر ${lightboxIndex + 1}`}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
