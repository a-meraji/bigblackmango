import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import type { Story } from '@types/home';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import IconButton from '@components/icon-button/IconButton';
import { useFocusTrap } from '@hooks/useFocusTrap';
import styles from './StoryViewer.module.css';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION_MS = 5000;

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, overlayRef);
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const story = stories[index];

  const goNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgress(0);
    }
  }, [index]);

  // Auto-advance progress bar
  useEffect(() => {
    setProgress(0);
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / STORY_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, goNext]);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!story) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`استوری: ${story.title}`}
    >
      {/* Progress bars */}
      <div className={styles.progressRow} aria-hidden="true">
        {stories.map((_, i) => (
          <div key={i} className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{
                inlineSize: i < index ? '100%' : i === index ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.storyTitle}>{story.title}</span>
        <IconButton
          icon={X}
          label="بستن استوری"
          variant="ghost"
          className={styles.closeBtn}
          onClick={onClose}
        />
      </div>

      <div className={styles.media}>
        {story.mediaType === 'video' ? (
          <video
            src={resolveMediaUrl(story.mediaUrl)}
            className={styles.mediaContent}
            autoPlay
            muted
            playsInline
          />
        ) : (
          <img
            src={resolveMediaUrl(story.mediaUrl)}
            alt={story.title}
            className={styles.mediaContent}
          />
        )}
        <div className={styles.tapZones}>
          <button type="button" className={styles.tapPrev} onClick={goPrev} aria-label="استوری قبلی" />
          <button type="button" className={styles.tapNext} onClick={goNext} aria-label="استوری بعدی" />
        </div>
      </div>
    </div>
  );
}
