import type { ServiceTestimonial } from '@t/party-service';
import TestimonialsRow from '@features/customer/party-service/components/TestimonialsRow';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './TestimonialsSection.module.css';

interface Props {
  sectionTitle: string;
  testimonials: ServiceTestimonial[];
}

export default function TestimonialsSection({ sectionTitle, testimonials }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <section className={styles.section}>
      <LandingSectionHeader title={sectionTitle} />
      <TestimonialsRow testimonials={testimonials} autoScroll />
    </section>
  );
}
