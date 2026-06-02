import { Link } from 'react-router-dom';
import styles from './TopNav.module.css';

export default function TopNav() {
  return (
    <header className={styles.nav} role="banner">
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="بیگ بلک منگو — صفحه اصلی">
          <span className={styles.logoPlaceholder} aria-hidden="true">ب</span>
          <span className={styles.brandName}>بیگ بلک منگو</span>
        </Link>
      </div>
    </header>
  );
}
