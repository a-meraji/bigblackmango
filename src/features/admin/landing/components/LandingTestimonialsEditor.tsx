import Input from '@components/input/Input';
import { MediaPickerField } from '@components/media-picker';
import type { LandingTestimonial } from '@t/landing';
import styles from './LandingEditorForm.module.css';

interface Props {
  testimonials: LandingTestimonial[];
  onChange: (testimonials: LandingTestimonial[]) => void;
}

export default function LandingTestimonialsEditor({ testimonials, onChange }: Props) {
  function addItem() {
    if (testimonials.length >= 12) return;
    onChange([
      ...testimonials,
      { authorName: '', role: null, text: '', rating: 5, avatarUrl: null },
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

      {testimonials.length === 0 && (
        <p className={styles.hint}>نظری اضافه نشده است.</p>
      )}

      {testimonials.map((item, index) => (
        <div key={index} className={styles.statRow}>
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
          <div>
            <label className={styles.fieldLabel} htmlFor={`testi-rating-${index}`}>
              امتیاز (۱ تا ۵)
            </label>
            <input
              id={`testi-rating-${index}`}
              type="number"
              min={1}
              max={5}
              className={styles.numberInput}
              value={item.rating}
              onChange={(e) =>
                updateItem(index, 'rating', Math.min(5, Math.max(1, Number(e.target.value) || 5)))
              }
            />
          </div>
          <MediaPickerField
            label="آواتار (اختیاری)"
            value={item.avatarUrl ?? ''}
            onChange={(url) => updateItem(index, 'avatarUrl', url || null)}
          />
          <button type="button" className={styles.removeBtn} onClick={() => removeItem(index)}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
}
