import { useState, useMemo } from 'react';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import styles from './IconPicker.module.css';

const EXCLUDED = new Set(['createLucideIcon', 'LucideProvider', 'useLucideContext', 'default']);
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(
  (name) => !EXCLUDED.has(name) && !name.endsWith('Icon'),
);

const POPULAR_ICON_NAMES = [
  'Music', 'Music2', 'Mic', 'Mic2', 'Headphones', 'Speaker', 'Volume2', 'Radio',
  'Camera', 'Video', 'Film', 'Image', 'Clapperboard', 'Play',
  'Star', 'Heart', 'Sparkles', 'Crown', 'Trophy', 'Award', 'Medal',
  'PartyPopper', 'Cake', 'Gift', 'Package', 'Balloon',
  'Wine', 'Beer', 'Coffee', 'Utensils', 'UtensilsCrossed', 'ChefHat', 'Pizza',
  'Users', 'User', 'UserCheck', 'Users2',
  'MapPin', 'Map', 'Building', 'Building2', 'Home',
  'Phone', 'MessageSquare', 'Mail', 'Send',
  'Calendar', 'Clock', 'Timer', 'AlarmClock',
  'CheckCircle', 'Shield', 'Check', 'BadgeCheck',
  'Flower', 'Flower2', 'Sun', 'Moon', 'Leaf', 'TreePine',
  'Car', 'Smile', 'Zap', 'Flame',
  'Gem', 'Palette', 'Brush', 'Wand2',
  'Layers', 'List', 'Tag', 'Grid3x3',
].filter((name) => ALL_ICON_NAMES.includes(name));

const MAX_SEARCH_RESULTS = 120;

interface Props {
  label?: string;
  value: string | null;
  onChange: (name: string | null) => void;
}

export default function IconPicker({ label = 'آیکون', value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const displayed = useMemo(() => {
    if (!search.trim()) return POPULAR_ICON_NAMES;
    const q = search.toLowerCase();
    return ALL_ICON_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(0, MAX_SEARCH_RESULTS);
  }, [search]);

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setSearch('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>

      <div className={styles.trigger}>
        <button
          type="button"
          className={styles.previewBtn}
          onClick={() => setOpen((o) => !o)}
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

      {open && (
        <div className={styles.panel}>
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
            {search.trim() ? `${displayed.length} آیکون یافت شد` : 'آیکون‌های پیشنهادی'}
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

            {displayed.length === 0 && (
              <p className={styles.noResult}>آیکونی یافت نشد</p>
            )}
          </div>

          {!search.trim() && (
            <p className={styles.searchHint}>برای مشاهده همه آیکون‌ها در کادر بالا جستجو کنید</p>
          )}
        </div>
      )}
    </div>
  );
}
