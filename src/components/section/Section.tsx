import clsx from 'clsx';
import styles from './Section.module.css';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** When true, title uses global sectionTitle padding (for full-bleed children) */
  flush?: boolean;
}

export default function Section({ title, children, className, flush = false }: SectionProps) {
  return (
    <section className={clsx(styles.section, flush && styles.flush, className)}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </section>
  );
}
