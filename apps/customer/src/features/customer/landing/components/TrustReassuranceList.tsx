import styles from './TrustReassuranceList.module.css';

interface Props {
  items: string[];
}

export default function TrustReassuranceList({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <ul className={styles.list} aria-label="مزایای نصب">
      {items.map((item) => (
        <li key={item} className={styles.item}>
          <span className={styles.check} aria-hidden="true">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
