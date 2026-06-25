import { useState, useMemo } from 'react';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import { Search, X } from 'lucide-react';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import { ICON_NAMES } from '@components/lucide-icon/icon-map';
import styles from './IconPicker.module.css';

interface Props {
  label?: string;
  value: string | null;
  onChange: (name: string | null) => void;
  /** `gridSpan`: trigger sits in parent 3-col grid; panel spans full width on next row */
  layout?: 'default' | 'gridSpan';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function IconPicker({
  label = 'آیکون',
  value,
  onChange,
  layout = 'default',
  open: openProp,
  onOpenChange,
}: Props) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp ?? openInternal;
  const [search, setSearch] = useState('');

  function setOpen(next: boolean) {
    if (openProp === undefined) setOpenInternal(next);
    onOpenChange?.(next);
  }

  const displayed = useMemo(() => {
    if (!search.trim()) return ICON_NAMES;
    const q = search.toLowerCase();
    return ICON_NAMES.filter((n) => n.toLowerCase().includes(q));
  }, [search]);

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setSearch('');
  }

  function toggleOpen() {
    setOpen(!open);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  const panel = open ? (
    <div className={layout === 'gridSpan' ? styles.panelGridSpan : styles.panel}>
      <div className={styles.searchRow}>
        <Search size={14} className={styles.searchIcon} />
        <RawLocalizedInput
          className={styles.searchInput}
          type="text"
          placeholder="جستجو در آیکون‌ها..."
          value={search}
          onChange={setSearch}
          autoFocus
          dir="ltr"
        />
        {search && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setSearch('')}
            aria-label="پاک کردن جستجو"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <p className={styles.hint}>
        {search.trim() ? `${displayed.length} آیکون یافت شد` : 'آیکون‌ها'}
      </p>

      <div className={styles.grid} role="listbox" aria-label="انتخاب آیکون">
        {displayed.map((name) => (
          <button
            key={name}
            type="button"
            role="option"
            aria-selected={value === name}
            className={`${styles.iconBtn} ${value === name ? styles.iconBtnSelected : ''}`}
            onClick={() => select(name)}
            title={name}
            aria-label={name}
          >
            <LucideIcon name={name} size={20} />
          </button>
        ))}

        {displayed.length === 0 && <p className={styles.noResult}>آیکونی یافت نشد</p>}
      </div>
    </div>
  ) : null;

  if (layout === 'gridSpan') {
    return (
      <>
        <div className={styles.gridSpanCell}>
          <span className={styles.label}>{label}</span>
          <div className={styles.trigger}>
            <button
              type="button"
              className={styles.previewBtnCompact}
              onClick={toggleOpen}
              aria-expanded={open}
            >
              {value ? (
                <>
                  <LucideIcon name={value} size={18} />
                  <span className={styles.iconName}>{value}</span>
                </>
              ) : (
                <span className={styles.placeholder}>انتخاب...</span>
              )}
            </button>
            {value && (
              <button type="button" className={styles.clearBtn} onClick={clear} aria-label="حذف آیکون">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        {panel}
      </>
    );
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>

      <div className={styles.trigger}>
        <button
          type="button"
          className={styles.previewBtn}
          onClick={toggleOpen}
          aria-expanded={open}
        >
          {value ? (
            <>
              <LucideIcon name={value} size={18} />
              <span className={styles.iconName}>{value}</span>
            </>
          ) : (
            <span className={styles.placeholder}>انتخاب آیکون...</span>
          )}
        </button>
        {value && (
          <button type="button" className={styles.clearBtn} onClick={clear} aria-label="حذف آیکون">
            <X size={14} />
          </button>
        )}
      </div>

      {panel}
    </div>
  );
}
