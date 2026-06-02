import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Plus } from 'lucide-react';
import type { Address } from '@api/profile';
import clsx from 'clsx';
import styles from './AddressPicker.module.css';

interface Props {
  addresses: Address[];
  selectedId: string | undefined;
  onSelectSaved: (id: string) => void;
  onChooseNew: () => void;
  disabled?: boolean;
}

function truncateLine(text: string, max = 52) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function AddressPicker({
  addresses,
  selectedId,
  onSelectSaved,
  onChooseNew,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = addresses.find((a) => a.id === selectedId);
  const triggerLabel = selected ? selected.label?.trim() || 'آدرس ذخیره‌شده' : 'آدرس جدید';
  const triggerLine = selected ? truncateLine(selected.addressLine) : 'آدرس جدید وارد می‌کنید';

  function openDropdown() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) { setOpen(true); return; }
    const maxH = 320;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    if (spaceBelow >= 150 || spaceBelow >= spaceAbove) {
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + gap,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(spaceBelow, maxH),
        zIndex: 200,
      });
    } else {
      setPanelStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + gap,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(spaceAbove, maxH),
        zIndex: 200,
      });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    function onPointerDown(e: MouseEvent) {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  if (addresses.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrap} ref={rootRef}>
      <span className={styles.fieldLabel}>انتخاب آدرس</span>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => { if (!disabled) open ? setOpen(false) : openDropdown(); }}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span className={styles.triggerIcon} aria-hidden>
          <MapPin size={18} />
        </span>
        <span className={styles.triggerText}>
          <span className={styles.triggerTitle}>{triggerLabel}</span>
          <span className={styles.triggerSub}>{triggerLine}</span>
        </span>
        <ChevronDown
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          size={20}
          aria-hidden
        />
      </button>

      {open && (
        <div className={styles.panel} style={panelStyle} role="listbox">
          <ul className={styles.list}>
            {addresses.map((addr) => {
              const isActive = selectedId === addr.id;
              return (
                <li key={addr.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={clsx(styles.option, isActive && styles.optionActive)}
                    onClick={() => {
                      onSelectSaved(addr.id);
                      setOpen(false);
                    }}
                  >
                    <span className={styles.optionCheck} aria-hidden>
                      {isActive ? <Check size={16} strokeWidth={2.5} /> : null}
                    </span>
                    <span className={styles.optionBody}>
                      <span className={styles.optionTitle}>
                        {addr.label?.trim() || 'آدرس'}
                        {addr.isDefault ? (
                          <span className={styles.defaultBadge}>پیش‌فرض</span>
                        ) : null}
                      </span>
                      <span className={styles.optionLine}>
                        {addr.addressLine}
                        {addr.unit ? ` — واحد ${addr.unit}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className={styles.addNew}
            onClick={() => {
              onChooseNew();
              setOpen(false);
            }}
          >
            <Plus size={18} aria-hidden />
            <span>افزودن آدرس جدید</span>
          </button>
        </div>
      )}
    </div>
  );
}
