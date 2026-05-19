import clsx from 'clsx';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Extra bottom padding for floating cart / sticky footer */
  withCartInset?: boolean;
  withBottomNav?: boolean;
  narrow?: boolean;
}

export default function PageShell({
  children,
  className,
  withCartInset = false,
  withBottomNav = false,
  narrow = true,
}: PageShellProps) {
  return (
    <div
      className={clsx(
        styles.shell,
        narrow && styles.narrow,
        withCartInset && styles.cartInset,
        withBottomNav && styles.bottomNavInset,
        className,
      )}
    >
      {children}
    </div>
  );
}
