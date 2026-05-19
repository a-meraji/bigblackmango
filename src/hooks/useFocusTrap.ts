import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  active: boolean,
  externalRef?: RefObject<HTMLElement | null>,
) {
  const internalRef = useRef<HTMLElement | null>(null);
  const containerRef = externalRef ?? internalRef;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (!container) return;

    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' && focusables.length === 0) return;

      if (e.key !== 'Tab' || focusables.length === 0) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    container.addEventListener('keydown', onKeyDown);

    return () => {
      container.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [active, containerRef]);

  return containerRef;
}
