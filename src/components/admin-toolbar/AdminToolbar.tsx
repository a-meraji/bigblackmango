import { Plus } from 'lucide-react';
import Button from '@components/button/Button';
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
      <div className={styles.start}>
        {onSearchChange != null && (
          <input
            className={styles.search}
            type="search"
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? 'جستجو...'}
            aria-label={searchPlaceholder ?? 'جستجو'}
          />
        )}
        {children}
      </div>
      {onAdd && (
        <Button type="button" className={styles.addBtn} onClick={onAdd}>
          <Plus size={18} aria-hidden="true" />
          {addLabel ?? 'افزودن'}
        </Button>
      )}
    </div>
  );
}
