import { useToastStore } from '@store/toast.store';

export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    success: (msg: string) => push('success', msg),
    error: (msg: string) => push('error', msg),
    warning: (msg: string) => push('warning', msg),
    info: (msg: string) => push('info', msg),
  };
}
