import type { OrderStatus } from '@t/order';
import styles from './StatusIllustration.module.css';

function PendingIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="var(--yellow-100)" className={styles.pulseRing} />
      <circle cx="32" cy="32" r="22" fill="var(--yellow-100)" stroke="var(--yellow-300)" strokeWidth="2" />
      {/* tick marks */}
      <line x1="32" y1="12" x2="32" y2="16" stroke="var(--yellow-500)" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="32" x2="48" y2="32" stroke="var(--yellow-500)" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="52" x2="32" y2="48" stroke="var(--yellow-500)" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="32" x2="16" y2="32" stroke="var(--yellow-500)" strokeWidth="2" strokeLinecap="round" />
      {/* minute hand: from center (32,32) up to (32,16) */}
      <line x1="32" y1="32" x2="32" y2="16" stroke="var(--yellow-600)" strokeWidth="2.5" strokeLinecap="round" className={styles.minuteHand} />
      {/* hour hand: from center (32,32) to (40,32) — points right */}
      <line x1="32" y1="32" x2="40" y2="32" stroke="var(--yellow-500)" strokeWidth="2.5" strokeLinecap="round" className={styles.hourHand} />
      <circle cx="32" cy="32" r="2.5" fill="var(--yellow-600)" />
    </svg>
  );
}

function PreparingIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon} aria-hidden>
      {/* steam wisps */}
      <path d="M22 22 Q24 18 22 14" stroke="var(--yellow-400)" strokeWidth="2" strokeLinecap="round" className={styles.steam1} />
      <path d="M32 20 Q34 16 32 12" stroke="var(--yellow-400)" strokeWidth="2" strokeLinecap="round" className={styles.steam2} />
      <path d="M42 22 Q44 18 42 14" stroke="var(--yellow-400)" strokeWidth="2" strokeLinecap="round" className={styles.steam3} />
      {/* pot lid */}
      <rect x="18" y="27" width="28" height="4" rx="2" fill="var(--yellow-400)" />
      <rect x="27" y="23" width="10" height="4" rx="2" fill="var(--yellow-500)" />
      {/* pot body */}
      <rect x="16" y="31" width="32" height="20" rx="5" fill="var(--yellow-200)" stroke="var(--yellow-400)" strokeWidth="2" />
      {/* pot handles */}
      <path d="M16 37 Q10 37 10 43 Q10 49 16 49" stroke="var(--yellow-500)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M48 37 Q54 37 54 43 Q54 49 48 49" stroke="var(--yellow-500)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* flame at bottom */}
      <path d="M26 51 Q28 46 32 48 Q36 46 38 51 Q35 55 32 54 Q29 55 26 51Z" fill="var(--yellow-400)" className={styles.flame} />
    </svg>
  );
}

function CourierIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon} aria-hidden>
      <g className={styles.scooterBody}>
        {/* seat */}
        <rect x="20" y="20" width="18" height="5" rx="2.5" fill="var(--emerald-400)" />
        {/* body frame */}
        <path d="M24 25 L18 40 M38 25 L44 36" stroke="var(--emerald-500)" strokeWidth="3" strokeLinecap="round" />
        {/* handlebar */}
        <path d="M36 22 L44 22 L44 26" stroke="var(--emerald-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* body panel */}
        <path d="M24 25 L38 25 L44 36 L18 40 Z" fill="var(--emerald-200)" stroke="var(--emerald-400)" strokeWidth="1.5" />
        {/* box on back */}
        <rect x="12" y="28" width="10" height="8" rx="1.5" fill="var(--yellow-300)" stroke="var(--yellow-500)" strokeWidth="1.5" />
      </g>
      {/* front wheel */}
      <g className={styles.wheel}>
        <circle cx="44" cy="44" r="8" fill="none" stroke="var(--emerald-600)" strokeWidth="2.5" />
        <circle cx="44" cy="44" r="3" fill="var(--emerald-300)" />
        <line x1="44" y1="36" x2="44" y2="52" stroke="var(--emerald-500)" strokeWidth="1.5" />
        <line x1="36" y1="44" x2="52" y2="44" stroke="var(--emerald-500)" strokeWidth="1.5" />
      </g>
      {/* back wheel */}
      <g className={styles.wheel}>
        <circle cx="18" cy="44" r="8" fill="none" stroke="var(--emerald-600)" strokeWidth="2.5" />
        <circle cx="18" cy="44" r="3" fill="var(--emerald-300)" />
        <line x1="18" y1="36" x2="18" y2="52" stroke="var(--emerald-500)" strokeWidth="1.5" />
        <line x1="10" y1="44" x2="26" y2="44" stroke="var(--emerald-500)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function DeliveredIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon} aria-hidden>
      <circle cx="32" cy="32" r="26" fill="var(--emerald-100)" stroke="var(--emerald-300)" strokeWidth="2" className={styles.deliveredRing} />
      <polyline
        points="18,33 27,42 46,22"
        stroke="var(--emerald-500)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.checkMark}
      />
    </svg>
  );
}

function CancelledIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon} aria-hidden>
      <circle cx="32" cy="32" r="26" fill="var(--red-100)" stroke="var(--red-300)" strokeWidth="2" className={styles.cancelCircle} />
      <line x1="22" y1="22" x2="42" y2="42" stroke="var(--red-400)" strokeWidth="3.5" strokeLinecap="round" className={styles.xLine} />
      <line x1="42" y1="22" x2="22" y2="42" stroke="var(--red-400)" strokeWidth="3.5" strokeLinecap="round" className={styles.xLine} />
    </svg>
  );
}

const ILLUSTRATIONS: Record<OrderStatus, () => JSX.Element> = {
  pending_confirmation: PendingIllustration,
  preparing: PreparingIllustration,
  handed_to_courier: CourierIllustration,
  delivered: DeliveredIllustration,
  cancelled: CancelledIllustration,
};

interface Props {
  status: OrderStatus;
  size?: number;
}

export default function StatusIllustration({ status, size = 64 }: Props) {
  const Illustration = ILLUSTRATIONS[status];
  return (
    <span style={{ display: 'block', width: size, height: size }}>
      <Illustration />
    </span>
  );
}
