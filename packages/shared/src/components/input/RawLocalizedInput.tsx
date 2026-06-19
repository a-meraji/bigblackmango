import { useLocalizedDigits } from '@hooks/useLocalizedDigits';

interface RawLocalizedInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  normalizeDigits?: boolean;
  digitsOnly?: boolean;
}

export default function RawLocalizedInput({
  value,
  onChange,
  normalizeDigits = true,
  digitsOnly = false,
  type,
  inputMode,
  dir,
  ...rest
}: RawLocalizedInputProps) {
  const digitProps = useLocalizedDigits(value, onChange, {
    enabled: normalizeDigits,
    digitsOnly,
    type,
    inputMode,
    dir: dir as 'ltr' | 'rtl' | 'auto' | undefined,
  });

  return <input {...rest} {...digitProps} />;
}
