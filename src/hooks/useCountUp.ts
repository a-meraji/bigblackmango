import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 1100) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const startTime = performance.now();
        function tick(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, containerRef };
}
