import { useState } from 'react';
import type { Highlight } from '@t/party-service';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useVideoThumbnail } from '@hooks/useVideoThumbnail';
import HighlightViewer from './HighlightViewer';
import styles from './HighlightsRow.module.css';

interface AvatarProps {
  highlight: Highlight;
}

function HighlightAvatar({ highlight }: AvatarProps) {
  const videoFrame = useVideoThumbnail(
    highlight.thumbnailUrl ? undefined : resolveMediaUrl(highlight.videoUrl),
  );

  const imgSrc = highlight.thumbnailUrl
    ? resolveMediaUrl(highlight.thumbnailUrl)
    : videoFrame ?? undefined;

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt=""
        className={styles.avatar}
        loading="lazy"
        width={64}
        height={64}
      />
    );
  }

  return (
    <div className={styles.avatarPlaceholder} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

interface HighlightsRowProps {
  highlights: Highlight[];
}

export default function HighlightsRow({ highlights }: HighlightsRowProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (highlights.length === 0) return null;

  return (
    <>
      <ul className={styles.row} aria-label="هایلایت‌های سرویس">
        {highlights.map((h, i) => (
          <li key={h.id} className={styles.item}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => setActiveIndex(i)}
              aria-label={`مشاهده هایلایت: ${h.title}`}
            >
              <div className={styles.ring}>
                <HighlightAvatar highlight={h} />
              </div>
              <span className={styles.title}>{h.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <HighlightViewer
          highlights={highlights}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
