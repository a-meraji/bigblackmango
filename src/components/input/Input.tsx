import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helper, required, id, className, ...rest },
  ref,
) {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-')}`;
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
