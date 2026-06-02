import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import type { Highlight } from '@t/party-service';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import IconButton from '@components/icon-button/IconButton';
import { useFocusTrap } from '@hooks/useFocusTrap';
import styles from './HighlightViewer.module.css';

interface HighlightViewerProps {
  highlights: Highlight[];
  initialIndex: number;
  onClose: () => void;
}

export default function HighlightViewer({
  highlights,
  initialIndex,
  onClose,
}: HighlightViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useFocusTrap(true, overlayRef);

  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const highlight = highlights[index];

  const goNext = useCallback(() => {
    if (index < highlights.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [index, highlights.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgress(0);
    }
  }, [index]);

  // Reset and play video when index changes
  useEffect(() => {
    setProgress(0);
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [index]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget;
    if (v.duration && v.duration > 0) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  }

  if (!highlight) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`هایلایت: ${highlight.title}`}
    >
      {/* Progress bar */}
      <div className={styles.progressRow} aria-hidden="true">
        {highlights.map((_, i) => (
          <div key={i} className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{
                inlineSize:
                  i < index ? '100%' : i === index ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.highlightTitle}>{highlight.title}</span>
        <IconButton
          icon={X}
          label="بستن هایلایت"
          variant="ghost"
          className={styles.closeBtn}
          onClick={onClose}
        />
      </div>

      {/* Video */}
      <div className={styles.media}>
        <video
          ref={videoRef}
          key={highlight.id}
          src={resolveMediaUrl(highlight.videoUrl)}
          className={styles.video}
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={goNext}
        />
        <div className={styles.tapZones}>
          <button
            type="button"
            className={styles.tapPrev}
            onClick={goPrev}
            aria-label="هایلایت قبلی"
          />
          <button
            type="button"
            className={styles.tapNext}
            onClick={goNext}
            aria-label="هایلایت بعدی"
          />
        </div>
      </div>
    </div>
  );
}
