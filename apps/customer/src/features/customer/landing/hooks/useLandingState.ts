import { useEffect, useState } from 'react';

export function useLandingState(heroSentinelRef: React.RefObject<HTMLElement | null>) {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = heroSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [heroSentinelRef]);

  return { showSticky };
}
