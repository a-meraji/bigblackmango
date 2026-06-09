import { useEffect, type RefObject } from 'react';

function scrollTargetIntoView(target: Element) {
  target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/**
 * Scrolls the modal form to the first visible validation error
 * (banner, invalid input, or field-level alert).
 */
export function useScrollToFormFieldErrors(
  formRef: RefObject<HTMLElement | null>,
  fieldErrors: Record<string, string>,
) {
  const signature = Object.entries(fieldErrors)
    .filter(([, message]) => message)
    .map(([key, message]) => `${key}:${message}`)
    .join('|');

  useEffect(() => {
    if (!signature) return;

    const form = formRef.current;
    if (!form) return;

    requestAnimationFrame(() => {
      const banner = form.querySelector('[data-form-error-banner]');
      if (banner) {
        scrollTargetIntoView(banner);
        return;
      }

      const invalidInput = form.querySelector('[aria-invalid="true"]');
      if (invalidInput) {
        scrollTargetIntoView(invalidInput);
        return;
      }

      const fieldAlert = form.querySelector('[role="alert"]:not([data-form-error-banner])');
      if (fieldAlert) {
        scrollTargetIntoView(fieldAlert);
      }
    });
  }, [signature, formRef]);
}
