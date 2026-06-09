import { forwardRef, useCallback } from 'react';
import clsx from 'clsx';
import { toEnglishDigits, toPersianDigits } from '@utils/locale';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  normalizeDigits?: boolean;
  digitsOnly?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helper,
    required,
    id,
    className,
    value,
    onChange,
    type: originalType,
    inputMode: originalInputMode,
    dir: originalDir,
    normalizeDigits = true,
    digitsOnly = false,
    ...rest
  },
  ref,
) {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-')}`;

  const isNumericLike =
    originalType === 'number' ||
    originalType === 'tel' ||
    originalInputMode === 'numeric' ||
    originalInputMode === 'decimal';

  const displayValue = normalizeDigits && value != null ? toPersianDigits(String(value)) : value;

  const resolvedType = normalizeDigits && originalType === 'number' ? 'text' : originalType;

  const resolvedInputMode =
    normalizeDigits && originalType === 'number'
      ? 'decimal'
      : (originalInputMode ?? (isNumericLike ? 'numeric' : undefined));

  const resolvedDir = originalDir ?? (isNumericLike ? 'ltr' : undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;
      if (!normalizeDigits) {
        onChange(e);
        return;
      }
      let next = toEnglishDigits(e.target.value);
      if (digitsOnly) next = next.replace(/\D/g, '');
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(e.target, next);
      onChange(e);
    },
    [onChange, normalizeDigits, digitsOnly],
  );

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(styles.input, error && styles.hasError, className)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        required={required}
        value={displayValue}
        onChange={handleChange}
        type={resolvedType}
        inputMode={resolvedInputMode}
        dir={resolvedDir}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {!error && helper && (
        <span id={`${inputId}-helper`} className={styles.helper}>
          {helper}
        </span>
      )}
    </div>
  );
});

export default Input;
