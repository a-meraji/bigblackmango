import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import TagInput from '@features/admin/foods/components/TagInput';
import { uploadImage } from '@api/uploads';
import type { AdminCategory, AdminFood } from '@types/admin-catalog';
import type { FoodPayload } from '@api/admin/foods';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './FoodFormModal.module.css';

interface FoodFormModalProps {
  initial: AdminFood | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSave: (payload: FoodPayload) => Promise<void>;
}

export default function FoodFormModal({
  initial,
  categories,
  onClose,
  onSave,
}: FoodFormModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial?.name ?? '');
  const [shortDesc, setShortDesc] = useState(initial?.shortDescription ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category.id ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewSrc = resolveMediaUrl(imageUrl);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'نام الزامی است';
    if (!categoryId) e.categoryId = 'دسته‌بندی الزامی است';
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) e.price = 'قیمت معتبر وارد کنید';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'foods');
      setImageUrl(url);
    } catch {
      setErrors((prev) => ({ ...prev, imageUrl: 'آپلود تصویر ناموفق بود.' }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await onSave({
        name: name.trim(),
        shortDescription: shortDesc.trim() || undefined,
        description: desc.trim() || undefined,
        categoryId,
        price: Number(price),
        imageUrl: imageUrl.trim() || undefined,
        tags,
        isActive,
      });
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'CONFLICT') setErrors({ name: 'این غذا یا دسته‌بندی قابل ثبت نیست.' });
      else setErrors({ form: 'خطا در ذخیره‌سازی.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={initial ? 'ویرایش غذا' : 'غذای جدید'} size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.form && (
          <p className={styles.formError} role="alert">
            {errors.form}
          </p>
        )}
        <div className={styles.grid}>
          <Input
            label="نام غذا"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <div>
            <label className={styles.selectLabel} htmlFor="food-category">
              دسته‌بندی *
            </label>
            <select
              id="food-category"
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">انتخاب کنید</option>
              {categories
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            {errors.categoryId && <span className={styles.fieldError}>{errors.categoryId}</span>}
          </div>
          <Input
            label="قیمت (تومان)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            required
            dir="ltr"
          />
          <div className={styles.imageField}>
            <span className={styles.selectLabel}>تصویر</span>
            <div className={styles.imageRow}>
              {previewSrc ? (
                <img src={previewSrc} alt="" className={styles.preview} />
              ) : (
                <span className={styles.previewPlaceholder}>بدون تصویر</span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.fileInput}
                onChange={handleImageChange}
                disabled={uploading}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {imageUrl ? 'تغییر تصویر' : 'آپلود تصویر'}
              </Button>
            </div>
            {errors.imageUrl && <span className={styles.fieldError}>{errors.imageUrl}</span>}
            <Input
              label="یا آدرس تصویر"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
        <Input
          label="توضیح کوتاه"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
        />
        <div>
          <label className={styles.selectLabel} htmlFor="food-desc">
            توضیح کامل
          </label>
          <textarea
            id="food-desc"
            className={styles.textarea}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
          />
        </div>
        <TagInput label="تگ‌ها" tags={tags} onChange={setTags} />
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          فعال (نمایش در کاتالوگ)
        </label>
        <Button type="submit" fullWidth loading={loading}>
          {initial ? 'ذخیره تغییرات' : 'ایجاد غذا'}
        </Button>
      </form>
    </Modal>
  );
}
