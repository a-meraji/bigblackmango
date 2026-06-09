import type { ServiceStat } from '@t/party-service';
import { useCountUp } from '@hooks/useCountUp';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import styles from './ServiceStatsRow.module.css';
import { formatNumber, toPersianDigits, toEnglishDigits } from '@utils/locale';

interface StatItemProps {
  stat: ServiceStat;
}

function parseValue(value: string): { num: number; suffix: string } {
  const normalized = toEnglishDigits(value);
  const match = normalized.match(/^(\d[\d,]*)(.*)$/);
  if (match) {
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    return { num, suffix: match[2] };
  }
  return { num: 0, suffix: value };
}

function StatItem({ stat }: StatItemProps) {
  const { num, suffix } = parseValue(stat.value);
  const { count, containerRef } = useCountUp(num);

  return (
    <li
      ref={containerRef as React.RefObject<HTMLLIElement>}
      className={styles.item}
    >
      {stat.icon && (
        <span className={styles.icon} aria-hidden="true">
          <LucideIcon name={stat.icon} size={24} />
        </span>
      )}
      <span className={styles.number}>
        {formatNumber(count)}
        <span className={styles.suffix}>{toPersianDigits(suffix)}</span>
      </span>
      <span className={styles.label}>{stat.label}</span>
    </li>
  );
}

interface Props {
  stats: ServiceStat[];
}

export default function ServiceStatsRow({ stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <ul className={styles.row} aria-label="آمار و دستاوردها">
      {stats.map((stat, i) => (
        <StatItem key={i} stat={stat} />
      ))}
    </ul>
  );
}
