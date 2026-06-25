import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import styles from './DepthCarousel.module.css';

const DEFAULT_AUTO_ADVANCE_MS = 2500;
const DEFAULT_DOTS_ARIA_LABEL = 'انتخاب غذا';
const SWIPE_THRESHOLD_PX = 50;
const TRANSITION_MS = 700;
const SWIPE_COOLDOWN_MS = 3000;
const DRAG_COOLDOWN_MS = 1000;

interface SlideContext {
  position: number;
  isActive: boolean;
  index: number;
}

export interface DepthCarouselProps<T> {
  items: T[];
  getItemKey: (item: T) => string;
  renderSlide: (item: T, ctx: SlideContext) => ReactNode;
  ariaLabel: string;
  className?: string;
  externalPaused?: boolean;
  autoAdvanceMs?: number;
  dotsAriaLabel?: string;
  getDotAriaLabel?: (index: number) => string;
}

function getCardPosition(index: number, currentIndex: number, length: number): number {
  if (length <= 0) return 0;

  let diff = index - currentIndex;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

function getFallbackMotion(position: number, rtlFactor: number) {
  const sign = Math.sign(position);
  const translateX = sign * Math.abs(position) * 100 * rtlFactor;

  return {
    transform: `translate3d(${translateX}%, 0, 0) scale(0.66)`,
    opacity: 0,
    filter: 'blur(4px)',
    zIndex: 5,
  };
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest('button, a, [role="button"], audio, input, textarea, select'),
  );
}

interface CarouselSlideProps<T> {
  item: T;
  index: number;
  position: number;
  isActive: boolean;
  reducedMotion: boolean;
  rtlFactor: number;
  renderSlide: (item: T, ctx: SlideContext) => ReactNode;
}

const CarouselSlide = memo(function CarouselSlide<T>({
  item,
  index,
  position,
  isActive,
  reducedMotion,
  rtlFactor,
  renderSlide,
}: CarouselSlideProps<T>) {
  const useFallback = Math.abs(position) > 3;
  const fallbackMotion = useFallback ? getFallbackMotion(position, rtlFactor) : null;

  return (
    <div
      className={styles.slide}
      data-position={useFallback ? undefined : position}
      style={{
        ...(fallbackMotion ?? {}),
        transitionDuration: reducedMotion ? '0ms' : `${TRANSITION_MS}ms`,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      aria-hidden={!isActive}
    >
      {renderSlide(item, { position, isActive, index })}
    </div>
  );
}) as <T>(props: CarouselSlideProps<T>) => ReactNode;

export default function DepthCarousel<T>({
  items,
  getItemKey,
  renderSlide,
  ariaLabel,
  className,
  externalPaused = false,
  autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS,
  dotsAriaLabel = DEFAULT_DOTS_ARIA_LABEL,
  getDotAriaLabel = (index) => `غذای ${index + 1}`,
}: DepthCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isUserInteractionPaused, setIsUserInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [rtlFactor, setRtlFactor] = useState(-1);

  const dragStartXRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const isPaused =
    externalPaused || isHoverPaused || isDragging || isUserInteractionPaused;

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(
    (delayMs: number) => {
      clearResumeTimeout();
      setIsUserInteractionPaused(true);
      resumeTimeoutRef.current = setTimeout(() => {
        setIsUserInteractionPaused(false);
        resumeTimeoutRef.current = null;
      }, delayMs);
    },
    [clearResumeTimeout],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [items.length]);

  useEffect(() => {
    setRtlFactor(document.documentElement.dir === 'rtl' ? -1 : 1);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (items.length <= 1 || isPaused || reducedMotion) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoAdvanceMs);

    return () => window.clearInterval(timer);
  }, [autoAdvanceMs, isPaused, items.length, reducedMotion]);

  useEffect(() => () => clearResumeTimeout(), [clearResumeTimeout]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (items.length <= 1 || isInteractiveTarget(event.target)) return;

    clearResumeTimeout();
    setIsUserInteractionPaused(false);
    dragStartXRef.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDragging) return;

    const dragDistance = event.clientX - dragStartXRef.current;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(dragDistance) >= SWIPE_THRESHOLD_PX) {
      if (dragDistance < -SWIPE_THRESHOLD_PX) {
        goToNext();
      } else {
        goToPrevious();
      }
      scheduleResume(SWIPE_COOLDOWN_MS);
    } else {
      scheduleResume(DRAG_COOLDOWN_MS);
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDragging) return;

    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    scheduleResume(DRAG_COOLDOWN_MS);
  }

  if (items.length === 0) return null;

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <div
        ref={stageRef}
        className={`${styles.stage} ${items.length <= 1 ? styles.stageSingle : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={(event) => {
          if (isDragging) event.preventDefault();
        }}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
        style={{ touchAction: 'pan-y' }}
      >
        {items.map((item, index) => {
          const position = getCardPosition(index, currentIndex, items.length);
          const isActive = index === currentIndex;

          return (
            <CarouselSlide
              key={getItemKey(item)}
              item={item}
              index={index}
              position={position}
              isActive={isActive}
              reducedMotion={reducedMotion}
              rtlFactor={rtlFactor}
              renderSlide={renderSlide}
            />
          );
        })}
      </div>

      {items.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label={dotsAriaLabel}>
          {items.map((item, index) => (
            <button
              key={getItemKey(item)}
              type="button"
              role="tab"
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              aria-selected={index === currentIndex}
              aria-label={getDotAriaLabel(index)}
              onClick={() => {
                clearResumeTimeout();
                setIsUserInteractionPaused(false);
                setCurrentIndex(index);
                scheduleResume(SWIPE_COOLDOWN_MS);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
