import { useRevealOnScroll } from '@hooks/useRevealOnScroll';
import styles from '../LandingHomePage.module.css';

export default function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ''}`}>
      {children}
    </div>
  );
}
