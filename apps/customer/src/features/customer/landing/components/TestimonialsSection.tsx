import { Star } from 'lucide-react';
import type { ServiceTestimonial } from '@t/party-service';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import DepthCarousel from './DepthCarousel';
import LandingSectionHeader from './LandingSectionHeader';
import styles from './TestimonialsSection.module.css';

interface Props {
  sectionTitle: string;
  testimonials: ServiceTestimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          className={index < rating ? styles.starFilled : styles.starEmpty}
        />
      ))}
    </span>
  );
}

function TestimonialCarouselCard({
  testimonial,
  isActive,
}: {
  testimonial: ServiceTestimonial;
  isActive: boolean;
}) {
  return (
    <article
      className={styles.card}
      tabIndex={isActive ? 0 : -1}
      aria-label={`نظر ${testimonial.authorName}`}
    >
      <blockquote className={styles.quote}>
        <p className={styles.text}>«{testimonial.text}»</p>
      </blockquote>
      <div className={styles.footer}>
        <StarRating rating={testimonial.rating} />
        {testimonial.avatarUrl ? (
          <img
            src={resolveMediaUrl(testimonial.avatarUrl)}
            alt=""
            className={styles.avatar}
            loading={isActive ? 'eager' : 'lazy'}
          />
        ) : (
          <div className={styles.avatarPlaceholder} aria-hidden="true">
            {testimonial.authorName.charAt(0)}
          </div>
        )}
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{testimonial.authorName}</span>
          {testimonial.role && <span className={styles.role}>{testimonial.role}</span>}
        </div>
      </div>
    </article>
  );
}

export default function TestimonialsSection({ sectionTitle, testimonials }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.header}>
        <LandingSectionHeader id="testimonials-title" title={sectionTitle} />
      </div>
      <DepthCarousel
        className={styles.carousel}
        items={testimonials}
        getItemKey={(testimonial) => testimonial.id}
        ariaLabel="نظرات مشتریان"
        dotsAriaLabel="انتخاب نظر"
        getDotAriaLabel={(index) => `نظر ${index + 1}`}
        autoAdvanceMs={4000}
        renderSlide={(testimonial, { isActive }) => (
          <TestimonialCarouselCard testimonial={testimonial} isActive={isActive} />
        )}
      />
    </section>
  );
}
