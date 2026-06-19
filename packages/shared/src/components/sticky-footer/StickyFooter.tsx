import clsx from 'clsx';
import styles from './StickyFooter.module.css';

interface StickyFooterProps {
  children: React.ReactNode;
  className?: string;
}

export default function StickyFooter({ children, className }: StickyFooterProps) {
  return <footer className={clsx(styles.footer, className)}>{children}</footer>;
}
