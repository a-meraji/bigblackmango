import { useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import type { AdminServiceTestimonial } from '@t/admin-content';
import type { TestimonialPayload } from '@api/admin/testimonials';
import styles from './TestimonialFormModal.module.css';

interface Props {
  servicePageId: string;
  initial: AdminServiceTestimonial | null;
  onClose: () => void;
  onSave: (payload: Partial<TestimonialPayload>) => Promise<void>;
}

export default function TestimonialFormModal({ servicePageId, initial, onClose, onSave }: Props) {
  const [authorName, setAuthorName] = useState(initial?.authorName ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!authorName.trim()) e.authorName = 'نام الزامی است';
    if (!text.trim()) e.text = 'متن نظر الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        servicePageId,
        authorName: authorName.trim(),
        role: role.trim() || undefined,
        text: text.trim(),
        rating,
        avatarUrl: avatarUrl.trim() || undefined,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={initial ? 'ویرایش نظر' : 'نظر جدید'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="نام مشتری"
          value={authorName}
          onChange={(ev) => setAuthorName(ev.target.value)}
          error={errors.authorName}
          required
        />
        <Input
          label="نقش / موقعیت (اختیاری)"
          value={role}
          onChange={(ev) => setRole(ev.target.value)}
          placeholder="مثلاً: داماد، مادر عروس"
        />
        <div>
          <label className={styles.fieldLabel} htmlFor="testi-text">
            متن نظر <span className={styles.required}>*</span>
          </label>
          <textarea
            id="testi-text"
            className={`${styles.textarea} ${errors.text ? styles.textareaError : ''}`}
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            rows={4}
            placeholder="نظر مشتری..."
          />
          {errors.text && <span className={styles.errorMsg}>{errors.text}</span>}
        </div>

        <div>
          <span className={styles.fieldLabel}>امتیاز</span>
          <div className={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.star} ${n <= rating ? styles.starActive : ''}`}
                onClick={() => setRating(n)}
                aria-label={`امتیاز ${n}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <Input
          label="آدرس تصویر پروفایل (اختیاری)"
          value={avatarUrl}
          onChange={(ev) => setAvatarUrl(ev.target.value)}
          dir="ltr"
          placeholder="/uploads/..."
        />
        <Input
          label="ترتیب نمایش"
          value={sortOrder}
          onChange={(ev) => setSortOrder(ev.target.value)}
          type="number"
          dir="ltr"
        />
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(ev) => setIsActive(ev.target.checked)}
          />
          فعال (نمایش برای مشتریان)
        </label>
        <Button type="submit" fullWidth loading={loading}>
          {initial ? 'ذخیره تغییرات' : 'ثبت نظر'}
        </Button>
      </form>
    </Modal>
  );
}
