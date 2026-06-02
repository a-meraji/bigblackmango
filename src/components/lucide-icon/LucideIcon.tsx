import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface Props extends Omit<LucideProps, 'ref'> {
  name: string | null | undefined;
  size?: number;
}

export default function LucideIcon({ name, size = 18, ...props }: Props) {
  if (!name) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return null;
  return <Icon size={size} {...props} />;
}
