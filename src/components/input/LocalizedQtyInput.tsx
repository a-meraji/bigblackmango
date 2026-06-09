import { useEffect, useState } from 'react';
import { useLocalizedDigits } from '@hooks/useLocalizedDigits';

interface LocalizedQtyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> {
  value: number;
  onChange: (value: number) => void;
}

export default function LocalizedQtyInput({ value, onChange, ...rest }: LocalizedQtyInputProps) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const digitProps = useLocalizedDigits(
    local,
    (next) => {
      setLocal(next);
      const n = Number(next);
      if (!Number.isNaN(n)) onChange(n);
    },
    { type: 'number', dir: 'ltr' },
  );

  return <input {...rest} {...digitProps} />;
}
