import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function Spinner({ size = 'md', label = 'در حال بارگذاری...' }: SpinnerProps) {
  return <span className={`${styles.spinner} ${styles[size]}`} role="status" aria-label={label} />;
}
