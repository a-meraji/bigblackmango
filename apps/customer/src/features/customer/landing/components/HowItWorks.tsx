import type { LandingHowItWorks } from '@t/landing';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import { useRevealOnScroll } from '@hooks/useRevealOnScroll';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './HowItWorks.module.css';

interface Props {
  config: LandingHowItWorks;
}

function StepItem({
  step,
  index,
}: {
  step: LandingHowItWorks['steps'][number];
  index: number;
}) {
  const ref = useRevealOnScroll<HTMLLIElement>();

  return (
    <li
      ref={ref}
      className={styles.step}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className={styles.marker}>
        <span className={styles.number}>{index + 1}</span>
        <span className={styles.iconCircle}>
          <LucideIcon name={step.icon} size={16} />
        </span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{step.title}</h3>
        <p className={styles.body}>{step.body}</p>
      </div>
    </li>
  );
}

export default function HowItWorks({ config }: Props) {
  if (config.steps.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="how-it-works-title">
      <LandingSectionHeader id="how-it-works-title" title={config.sectionTitle} />
      <ol className={styles.list}>
        {config.steps.map((step, index) => (
          <StepItem key={`${step.title}-${index}`} step={step} index={index} />
        ))}
      </ol>
    </section>
  );
}
