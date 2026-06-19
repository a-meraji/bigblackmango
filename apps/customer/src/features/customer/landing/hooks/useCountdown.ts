import { useEffect, useState } from 'react';

function getRemainingMs(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const target = new Date(expiresAt).getTime();
  const diff = target - Date.now();
  return diff > 0 ? diff : 0;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function useCountdown(expiresAt: string | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(() =>
    getRemainingMs(expiresAt),
  );

  useEffect(() => {
    setRemainingMs(getRemainingMs(expiresAt));
    if (!expiresAt) return;

    const timer = setInterval(() => {
      setRemainingMs(getRemainingMs(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (remainingMs === null) return null;
  return formatRemaining(remainingMs);
}
