import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.wrapper} aria-label="صفحه‌بندی">
      <button
        type="button"
        className={styles.btn}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        قبلی
      </button>
      <span className={styles.info}>
        {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
      </span>
      <button
        type="button"
        className={styles.btn}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        بعدی
      </button>
    </nav>
  );
}
