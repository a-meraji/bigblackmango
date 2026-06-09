import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Loader2, ShoppingCart, X } from 'lucide-react';
import type { Story } from '@t/home';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { formatPrice } from '@utils/format-price';
import IconButton from '@components/icon-button/IconButton';
import { useFocusTrap } from '@hooks/useFocusTrap';
import { useAddToCart } from '@features/customer/cart/hooks/useAddToCart';
import styles from './StoryViewer.module.css';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_IMAGE_DURATION_MS = 5000;

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useFocusTrap(true, overlayRef);
  const [index, setIndex] = useState(initialIndex);
  const { addToCart, addingId } = useAddToCart();
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);

  function handleAddToCart(menuItemId: string, unitPrice: number, food: { id: string; name: string; thumbnailUrl: string | null }) {
    setAddedItemId(null);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addToCart({ menuItemId, unitPrice, food }).then(() => {
      setAddedItemId(menuItemId);
      addedTimerRef.current = setTimeout(() => setAddedItemId(null), 2500);
    });
  }

  useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); }, []);
  const story = stories[index];
  const isVideo = story?.mediaType === 'video';

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

  // Image auto-advance progress bar
  useEffect(() => {
    if (!story || isVideo) return;

    setProgress(0);
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / STORY_IMAGE_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, goNext, story, isVideo]);

  // Video progress synced to playback
  useEffect(() => {
    if (!isVideo) return;
    setProgress(0);
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [index, isVideo]);

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

  function handleVideoTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget;
    if (v.duration && v.duration > 0) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  }

  if (!story) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`استوری: ${story.title}`}
    >
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
        {isVideo ? (
          <video
            ref={videoRef}
            key={story.id}
            src={resolveMediaUrl(story.mediaUrl)}
            className={styles.mediaContent}
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={goNext}
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

        {story.menuItem && (
          <div className={styles.foodCard}>
            {story.menuItem.imageUrl ? (
              <img
                src={resolveMediaUrl(story.menuItem.imageUrl)}
                alt={story.menuItem.name}
                className={styles.foodThumb}
              />
            ) : (
              <div className={styles.foodThumbPlaceholder} aria-hidden="true" />
            )}
            <div className={styles.foodInfo}>
              <span className={styles.foodLabel}>همین الان سفارش بده</span>
              <span className={styles.foodName}>{story.menuItem.name}</span>
              <span className={styles.foodPrice}>{formatPrice(story.menuItem.price)}</span>
            </div>
            {(() => {
              const mid = story.menuItem!.menuItemId;
              const isAdding = addingId === mid;
              const isAdded  = !isAdding && addedItemId === mid;
              return (
                <button
                  type="button"
                  className={`${styles.foodAddBtn} ${isAdded ? styles.foodAddBtnAdded : ''}`}
                  disabled={isAdding}
                  onClick={() =>
                    handleAddToCart(
                      story.menuItem!.menuItemId,
                      story.menuItem!.price,
                      { id: story.menuItem!.foodId, name: story.menuItem!.name, thumbnailUrl: story.menuItem!.imageUrl },
                    )
                  }
                  aria-label={isAdded ? `${story.menuItem!.name} به سبد اضافه شد` : `افزودن ${story.menuItem!.name} به سبد خرید`}
                  aria-live="polite"
                >
                  <span
                    key={isAdding ? 'loading' : isAdded ? 'added' : 'idle'}
                    className={styles.foodAddBtnContent}
                  >
                    {isAdding ? (
                      <Loader2 size={15} className={styles.spinner} />
                    ) : isAdded ? (
                      <><Check size={15} strokeWidth={2.5} />اضافه شد</>
                    ) : (
                      <><ShoppingCart size={15} />افزودن به سبد</>
                    )}
                  </span>
                </button>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
