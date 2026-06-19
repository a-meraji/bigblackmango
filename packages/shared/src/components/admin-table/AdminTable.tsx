import clsx from 'clsx';
import Skeleton from '@components/skeleton/Skeleton';
import styles from './AdminTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  /** Label shown before the value in mobile card view.
   *  Pass false to suppress the label entirely (e.g. image columns).
   *  Defaults to `label`. */
  mobileLabel?: string | false;
  /** Hide this entire column in the mobile card view. */
  mobileHide?: boolean;
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
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className={styles.th} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={clsx(styles.tr, rowClassName?.(row))}>
              {columns.map((col) => {
                const mobileLabel =
                  col.mobileLabel === false
                    ? ''
                    : (col.mobileLabel ?? col.label);
                return (
                  <td
                    key={col.key}
                    className={clsx(styles.td, col.mobileHide && styles.tdHideMobile)}
                    data-label={mobileLabel}
                  >
                    {col.render(row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
