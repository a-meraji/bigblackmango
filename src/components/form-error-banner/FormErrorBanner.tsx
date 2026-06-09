import { useEffect, useRef } from 'react';
import styles from './FormErrorBanner.module.css';

interface FormErrorBannerProps {
  message: string;
}

export default function FormErrorBanner({ message }: FormErrorBannerProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!message.trim()) return;

    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [message]);

  if (!message) return null;

  return (
    <p
      ref={ref}
      className={styles.banner}
      role="alert"
      data-form-error-banner
    >
      {message}
    </p>
  );
}
