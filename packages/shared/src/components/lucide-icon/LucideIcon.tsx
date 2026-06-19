import type { LucideProps } from 'lucide-react';
import { ICON_MAP } from './icon-map';

interface Props extends Omit<LucideProps, 'ref'> {
  name: string | null | undefined;
  size?: number;
}

/**
 * Renders a lucide icon by name from the curated {@link ICON_MAP}. Unknown names render
 * nothing (graceful no-op). Backed by named imports — does NOT pull the full lucide barrel.
 */
export default function LucideIcon({ name, size = 18, ...props }: Props) {
  if (!name) return null;
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} {...props} />;
}
