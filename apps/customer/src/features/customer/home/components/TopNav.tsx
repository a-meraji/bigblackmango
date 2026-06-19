import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import styles from './TopNav.module.css';

interface TopNavProps {
  landingMode?: boolean;
}

export default function TopNav({ landingMode = false }: TopNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!landingMode) return;

    function onScroll() {
      setScrolled(window.scrollY > 60);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [landingMode]);

  return (
    <header
      className={clsx(styles.nav, landingMode && styles.landingNav, scrolled && styles.landingScrolled)}
      role="banner"
    >
      <div className={styles.inner}>
        {landingMode ? (
          <div className={styles.brandStatic} aria-label="بلک منگو">
            <img
              src="/icons/icon-192.png"
              alt=""
              className={styles.logo}
              width={44}
              height={44}
            />
            <span className={styles.brandName}>بلک منگو</span>
          </div>
        ) : (
          <Link to="/" className={styles.brand} aria-label="بلک منگو — صفحه اصلی">
            <img
              src="/icons/icon-192.png"
              alt="بلک منگو"
              className={styles.logo}
              width={44}
              height={44}
            />
            <span className={styles.brandName}>بلک منگو</span>
          </Link>
        )}
      </div>
    </header>
  );
}
