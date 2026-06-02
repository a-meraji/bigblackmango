import { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns-jalali';
import styles from './JalaliDateInput.module.css';

interface JalaliDateInputProps {
  value: string; // Gregorian ISO "YYYY-MM-DD"
  onChange: (gregorianIso: string) => void;
  label: string;
}

function normDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 1584));
}

function gregToJalali(iso: string): string {
  if (!iso) return '';
  try {
    return format(new Date(iso + 'T12:00:00'), 'yyyy/MM/dd');
  } catch {
    return '';
  }
}

function jalaliToGreg(jalali: string): string | null {
  const n = normDigits(jalali).trim();
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(n)) return null;
  try {
    const d = parse(n, 'yyyy/MM/dd', new Date());
    if (!isValid(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return null;
  }
}

export default function JalaliDateInput({ value, onChange, label }: JalaliDateInputProps) {
  const [localVal, setLocalVal] = useState(() => gregToJalali(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setLocalVal(gregToJalali(value));
    setInvalid(false);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const typed = e.target.value;
    setLocalVal(typed);
    const greg = jalaliToGreg(typed);
    if (greg) {
      setInvalid(false);
      onChange(greg);
    } else {
      setInvalid(typed.length > 0);
    }
  }

  function handleBlur() {
    const greg = jalaliToGreg(localVal);
    if (!greg) {
      setLocalVal(gregToJalali(value));
      setInvalid(false);
    }
  }

  return (
    <input
      type="text"
      className={`${styles.input} ${invalid ? styles.inputError : ''}`}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="۱۴۰۳/۰۱/۰۱"
      aria-label={label}
      aria-invalid={invalid}
      inputMode="numeric"
      dir="ltr"
      maxLength={10}
    />
  );
}
