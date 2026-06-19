import { Plus } from 'lucide-react';
import Button from '@components/button/Button';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import styles from './AdminToolbar.module.css';

interface AdminToolbarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

export default function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
  onAdd,
  addLabel,
}: AdminToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.mainRow}>
        {onSearchChange != null && (
          <RawLocalizedInput
            className={styles.search}
            type="search"
            value={searchValue ?? ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder ?? 'جستجو...'}
            aria-label={searchPlaceholder ?? 'جستجو'}
          />
        )}
        {onAdd && (
          <Button type="button" className={styles.addBtn} onClick={onAdd}>
            <Plus size={18} aria-hidden="true" />
            {addLabel ?? 'افزودن'}
          </Button>
        )}
      </div>
      {children && <div className={styles.filtersRow}>{children}</div>}
    </div>
  );
}
