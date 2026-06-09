import { useCallback } from 'react';
import { toEnglishDigits, toPersianDigits } from '@utils/locale';

interface UseLocalizedDigitsOptions {
  enabled?: boolean;
  digitsOnly?: boolean;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  dir?: 'ltr' | 'rtl' | 'auto';
}

export function useLocalizedDigits(
  value: string,
  onChange: (value: string) => void,
  options: UseLocalizedDigitsOptions = {},
) {
  const {
    enabled = true,
    digitsOnly = false,
    type: originalType,
    inputMode: originalInputMode,
    dir: originalDir,
  } = options;

  const isNumericLike =
    originalType === 'number' ||
    originalType === 'tel' ||
    originalInputMode === 'numeric' ||
    originalInputMode === 'decimal';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let next = enabled ? toEnglishDigits(e.target.value) : e.target.value;
      if (digitsOnly) next = next.replace(/\D/g, '');
      onChange(next);
    },
    [enabled, digitsOnly, onChange],
  );

  const displayValue = enabled ? toPersianDigits(value) : value;

  const type = enabled && originalType === 'number' ? 'text' : (originalType ?? 'text');

  const inputMode =
    enabled && originalType === 'number'
      ? 'decimal'
      : (originalInputMode ?? (isNumericLike ? 'numeric' : undefined));

  const dir: 'ltr' | 'rtl' | 'auto' | undefined =
    originalDir ?? (isNumericLike ? 'ltr' : undefined);

  return {
    value: displayValue,
    onChange: handleChange,
    type,
    inputMode,
    dir,
  };
}
