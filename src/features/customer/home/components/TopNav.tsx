import { Link } from 'react-router-dom';
import styles from './TopNav.module.css';

export default function TopNav() {
  return (
    <header className={styles.nav} role="banner">
      <div className={styles.inner}>
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
      </div>
    </header>
  );
}
