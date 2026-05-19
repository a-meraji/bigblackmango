import clsx from 'clsx';
import Skeleton from '@components/skeleton/Skeleton';
import styles from './AdminTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage: string;
  rowClassName?: (row: T) => string | undefined;
}

export default function AdminTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage,
  rowClassName,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className={styles.wrapper} aria-busy="true" aria-label="در حال بارگذاری">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={48} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className={styles.th} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={clsx(styles.tr, rowClassName?.(row))}>
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
