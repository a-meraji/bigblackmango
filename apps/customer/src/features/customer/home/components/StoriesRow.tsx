import { useState } from 'react';
import type { Story } from '@t/home';
import Skeleton from '@components/skeleton/Skeleton';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import StoryViewer from './StoryViewer';
import styles from './StoriesRow.module.css';

interface StoriesRowProps {
  stories: Story[];
  loading: boolean;
}

export default function StoriesRow({ stories, loading }: StoriesRowProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className={styles.row} aria-busy="true" aria-label="در حال بارگذاری استوری‌ها">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonItem}>
            <Skeleton width={60} height={60} borderRadius="50%" />
            <Skeleton width={48} height={12} borderRadius="var(--radius-sm)" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <>
      <ul className={styles.row} aria-label="استوری‌های امروز">
        {stories.map((story, i) => (
          <li key={story.id} className={styles.storyItem}>
            <button
              className={styles.storyBtn}
              onClick={() => setActiveIndex(i)}
              aria-label={`مشاهده استوری: ${story.title}`}
              type="button"
            >
              <div className={styles.ring}>
                <img
                  src={resolveMediaUrl(story.thumbnailUrl || story.mediaUrl)}
                  alt=""
                  className={styles.avatar}
                  loading="lazy"
                  width={60}
                  height={60}
                />
              </div>
              <span className={styles.title}>{story.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
