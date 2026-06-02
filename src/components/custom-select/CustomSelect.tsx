import { useState, useRef, useEffect, useId, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';
import styles from './CustomSelect.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropPos {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  openUp: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  /** Applied to the outer wrapper div */
  className?: string;
  'aria-label'?: string;
  /** sm matches compact toolbar/filter bars; md is the default form size */
  size?: 'sm' | 'md';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید',
  disabled = false,
  error,
  id: externalId,
  className,
  'aria-label': ariaLabel,
  size = 'md',
}: CustomSelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const listboxId = `${id}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [pos, setPos] = useState<DropPos | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOpt = options.find((o) => o.value === value) ?? null;

  /*
   * Walk up the DOM from the trigger to find the nearest <dialog> ancestor.
   * dialog.showModal() places the dialog in the browser top layer, which sits
   * above every z-index in the normal stacking context — so a portal rendered
   * into document.body would be invisible behind the modal.  Rendering into the
   * dialog element itself keeps the dropdown inside the same top-layer context.
   */
  const portalTarget = useMemo<Element>(() => {
    let node: HTMLElement | null = triggerRef.current;
    while (node) {
      if (node.tagName === 'DIALOG') return node;
      node = node.parentElement;
    }
    return document.body;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // re-evaluate when open changes (trigger may mount later)

  // ── Compute portal position ──────────────────────────────────────────────────
  const computePos = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 280 && rect.top > spaceBelow;
    setPos({
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
      width: Math.max(rect.width, 160),
      openUp,
    });
  }, []);

  // ── Open / close ─────────────────────────────────────────────────────────────
  function openDropdown() {
    if (disabled) return;
    computePos();
    const idx = options.findIndex((o) => o.value === value);
    setActiveIdx(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
  }

  function pickOption(val: string) {
    onChange(val);
    closeDropdown();
    triggerRef.current?.focus();
  }

  // ── Close on outside click ───────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      closeDropdown();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // ── Reposition on scroll / resize ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handle = () => computePos();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [open, computePos]);

  // ── Scroll active option into view ──────────────────────────────────────────
  useEffect(() => {
    if (!open || activeIdx < 0) return;
    const item = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const enabledIdxs = options.reduce<number[]>((acc, o, i) => {
      if (!o.disabled) acc.push(i);
      return acc;
    }, []);

    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = enabledIdxs.find((i) => i > activeIdx) ?? enabledIdxs[0];
        if (next !== undefined) setActiveIdx(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = [...enabledIdxs].reverse().find((i) => i < activeIdx) ?? enabledIdxs[enabledIdxs.length - 1];
        if (prev !== undefined) setActiveIdx(prev);
        break;
      }
      case 'Home':
        e.preventDefault();
        if (enabledIdxs[0] !== undefined) setActiveIdx(enabledIdxs[0]);
        break;
      case 'End':
        e.preventDefault();
        if (enabledIdxs.length) setActiveIdx(enabledIdxs[enabledIdxs.length - 1]);
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const opt = options[activeIdx];
        if (opt && !opt.disabled) pickOption(opt.value);
        break;
      }
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
        break;
      case 'Tab':
        closeDropdown();
        break;
      default: {
        // Type-ahead: jump to first option starting with the pressed char
        if (e.key.length === 1) {
          const ch = e.key.toLowerCase();
          const startAfter = enabledIdxs.filter((i) => i > activeIdx);
          const wrap = enabledIdxs;
          const pool = [...startAfter, ...wrap];
          const match = pool.find((i) => options[i].label.toLowerCase().startsWith(ch));
          if (match !== undefined) setActiveIdx(match);
        }
      }
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={clsx(styles.wrapper, className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined}
        aria-label={ariaLabel}
        aria-invalid={!!error || undefined}
        className={clsx(
          styles.trigger,
          styles[size],
          open && styles.triggerOpen,
          error && styles.triggerError,
          !selectedOpt && styles.triggerPlaceholder,
        )}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <span className={styles.triggerLabel}>
          {selectedOpt?.label ?? placeholder}
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={clsx(styles.chevron, open && styles.chevronOpen)}
        />
      </button>

      {error && (
        <span className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}

      {open && pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className={clsx(styles.listbox, pos.openUp && styles.listboxUp)}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
            }}
          >
            {options.map((opt, idx) => (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                className={clsx(
                  styles.option,
                  opt.value === value && styles.optionSelected,
                  idx === activeIdx && styles.optionActive,
                  opt.disabled && styles.optionDisabled,
                )}
                onMouseEnter={() => { if (!opt.disabled) setActiveIdx(idx); }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!opt.disabled) pickOption(opt.value);
                }}
              >
                <span className={styles.optionText}>{opt.label}</span>
                {opt.value === value && (
                  <Check size={13} aria-hidden="true" className={styles.checkIcon} />
                )}
              </li>
            ))}
          </ul>,
          portalTarget,
        )}
    </div>
  );
}
