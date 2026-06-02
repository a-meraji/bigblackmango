import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import TagInput from '@features/admin/foods/components/TagInput';
import CustomSelect from '@components/custom-select/CustomSelect';
import { uploadImage } from '@api/uploads';
import type { AdminCategory, AdminFood } from '@t/admin-catalog';
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
  const isEdit = !!initial;

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
  const [error, setError] = useState('');

  const previewSrc = resolveMediaUrl(imageUrl);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const path = await uploadImage(file, 'foods');
      setImageUrl(path);
    } catch {
      setError('آپلود تصویر ناموفق بود.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('نام غذا الزامی است.'); return; }
    if (!categoryId) { setError('دسته‌بندی الزامی است.'); return; }
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError('قیمت معتبر وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        shortDescription: shortDesc.trim() || undefined,
        description: desc.trim() || undefined,
        categoryId,
        price: priceNum,
        imageUrl: imageUrl.trim() || undefined,
        tags,
        isActive,
      });
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'CONFLICT') setError('این نام قبلاً ثبت شده است.');
      else setError('خطا در ذخیره‌سازی. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'ویرایش غذا' : 'غذای جدید'} size="lg">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ── Error banner ── */}
        {error && (
          <p className={styles.errorBanner} role="alert">{error}</p>
        )}

        {/* ══ Section: اطلاعات اصلی ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>اطلاعات اصلی</span>

          <Input
            label="نام غذا"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="food-category">
                دسته‌بندی *
              </label>
              <CustomSelect
                id="food-category"
                value={categoryId}
                onChange={setCategoryId}
                placeholder="انتخاب کنید"
                options={categories
                  .filter((c) => c.isActive)
                  .map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>

            <Input
              label="قیمت (تومان)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              dir="ltr"
            />
          </div>
        </div>

        {/* ══ Section: تصویر ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>تصویر</span>

          <input
            ref={fileRef}
            id="food-image-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={handleImageChange}
            aria-label="انتخاب فایل تصویر"
          />

          {previewSrc ? (
            <div className={styles.imagePreviewArea}>
              <img src={previewSrc} alt="پیش‌نمایش تصویر" className={styles.imagePreview} />
              <button
                type="button"
                className={styles.imageEditBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="تغییر تصویر"
              >
                {uploading ? '...' : 'تغییر'}
              </button>
            </div>
          ) : (
            <label
              htmlFor="food-image-input"
              className={styles.imageUploadZone}
              aria-label="انتخاب تصویر غذا"
            >
              {uploading ? (
                <span className={styles.uploadingText}>در حال آپلود...</span>
              ) : (
                <>
                  <span className={styles.uploadIconGlyph} aria-hidden="true">↑</span>
                  <span className={styles.uploadPrimary}>انتخاب تصویر</span>
                  <span className={styles.uploadHint}>jpg · png · webp</span>
                </>
              )}
            </label>
          )}

          {previewSrc && (
            <button
              type="button"
              className={styles.removeImageBtn}
              onClick={() => setImageUrl('')}
              disabled={uploading}
            >
              حذف تصویر
            </button>
          )}
        </div>

        {/* ══ Section: توضیحات ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>توضیحات</span>

          <Input
            label="توضیح کوتاه"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
          />

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="food-desc">
              توضیح کامل
            </label>
            <textarea
              id="food-desc"
              className={styles.textarea}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* ══ Section: تگ‌ها و تنظیمات ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>تگ‌ها و تنظیمات</span>

          <TagInput label="تگ‌ها" tags={tags} onChange={setTags} />

          <div className={styles.activeField}>
            <span className={styles.fieldLabel}>وضعیت نمایش</span>
            <div className={styles.activeControl}>
              <label className={styles.toggleWrapper} dir="ltr">
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  aria-label="وضعیت غذا"
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </label>
              <span className={styles.toggleText}>
                {isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <Button type="submit" fullWidth loading={loading} className={styles.submitBtn}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد غذا'}
        </Button>

      </form>
    </Modal>
  );
}
