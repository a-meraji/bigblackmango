import { Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Input from '@components/input/Input';
import IconButton from '@components/icon-button/IconButton';
import { MediaPickerField } from '@components/media-picker';
import type { LandingTestimonial } from '@t/landing';
import styles from './LandingEditorForm.module.css';

interface Props {
  sectionTitle: string;
  onSectionTitleChange: (value: string) => void;
  testimonials: LandingTestimonial[];
  onChange: (testimonials: LandingTestimonial[]) => void;
}

export default function LandingTestimonialsEditor({
  sectionTitle,
  onSectionTitleChange,
  testimonials,
  onChange,
}: Props) {
  function addItem() {
    if (testimonials.length >= 12) return;
    onChange([
      { authorName: '', role: null, text: '', rating: 5, avatarUrl: null },
      ...testimonials,
    ]);
  }

  function removeItem(index: number) {
    onChange(testimonials.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof LandingTestimonial,
    value: string | number | null,
  ) {
    onChange(
      testimonials.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>نظرات مشتریان</h2>
        <button
          type="button"
          className={styles.addBtn}
          onClick={addItem}
          disabled={testimonials.length >= 12}
        >
          + افزودن نظر
        </button>
      </div>

      <Input
        label="عنوان بخش"
        value={sectionTitle}
        onChange={(e) => onSectionTitleChange(e.target.value)}
      />

      {testimonials.length === 0 && (
        <p className={styles.hint}>نظری اضافه نشده است.</p>
      )}

      <div className={styles.cardList}>
        {testimonials.map((item, index) => (
          <div key={index} className={styles.cardItem}>
            <div className={styles.cardItemHeader}>
              <span className={styles.rowLabel}>نظر {index + 1}</span>
              <IconButton
                icon={Trash2}
                label={`حذف نظر ${index + 1}`}
                variant="ghost"
                className={styles.cardRemoveBtn}
                onClick={() => removeItem(index)}
              />
            </div>

            <div className={styles.testimonialMetaRow}>
              <Input
                label="نام"
                value={item.authorName}
                onChange={(e) => updateItem(index, 'authorName', e.target.value)}
              />
              <Input
                label="نقش (اختیاری)"
                value={item.role ?? ''}
                onChange={(e) => updateItem(index, 'role', e.target.value.trim() || null)}
              />
              <div className={styles.testimonialRating}>
                <span className={styles.fieldLabel}>امتیاز</span>
                <div className={styles.testimonialStars} role="group" aria-label="امتیاز">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={clsx(
                        styles.testimonialStar,
                        rating <= item.rating && styles.testimonialStarActive,
                      )}
                      onClick={() => updateItem(index, 'rating', rating)}
                      aria-label={`امتیاز ${rating}`}
                      aria-pressed={rating <= item.rating}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={styles.fieldLabel} htmlFor={`testi-text-${index}`}>
                متن نظر
              </label>
              <textarea
                id={`testi-text-${index}`}
                className={styles.textarea}
                value={item.text}
                onChange={(e) => updateItem(index, 'text', e.target.value)}
                rows={3}
              />
            </div>

            <MediaPickerField
              label="آواتار (اختیاری)"
              value={item.avatarUrl ?? ''}
              onChange={(url) => updateItem(index, 'avatarUrl', url || null)}
              allowedTypes="image"
              uploadFolder="general"
              previewAlt={item.authorName || 'آواتار'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
