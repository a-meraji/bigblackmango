import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { uploadImage } from '@api/uploads';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import type { AdminCategory } from '@t/admin-catalog';
import type { CategoryPayload } from '@api/admin/categories';
import styles from './CategoryFormModal.module.css';

interface CategoryFormModalProps {
  initial: AdminCategory | null;
  onClose: () => void;
  onCreate: (payload: CategoryPayload) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CategoryPayload>) => Promise<void>;
}

export default function CategoryFormModal({
  initial,
  onClose,
  onCreate,
  onUpdate,
}: CategoryFormModalProps) {
  const isEdit = !!initial;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [layoutWidth, setLayoutWidth] = useState<'1col' | '2col'>(initial?.layoutWidth ?? '1col');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
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
      const path = await uploadImage(file, 'categories');
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
    if (!name.trim()) { setError('نام دسته‌بندی الزامی است.'); return; }

    const slugVal = slug.trim();
    if (slugVal && !/^[a-z0-9-]+$/.test(slugVal)) {
      setError('شناسه URL فقط شامل حروف کوچک انگلیسی، اعداد و خط‌تیره می‌شود.');
      return;
    }

    const order = Number(sortOrder);
    if (Number.isNaN(order)) { setError('ترتیب نمایش معتبر نیست.'); return; }

    setLoading(true);
    setError('');
    try {
      const payload: CategoryPayload = {
        name: name.trim(),
        slug: slugVal || undefined,
        imageUrl: imageUrl.trim() || undefined,
        layoutWidth,
        sortOrder: order,
        isActive,
      };
      if (isEdit && initial) {
        await onUpdate(initial.id, payload);
      } else {
        await onCreate(payload);
      }
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'CONFLICT') setError('این نام یا شناسه URL قبلاً ثبت شده است.');
      else setError('خطا در ذخیره‌سازی. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ── Error banner ── */}
        {error && (
          <p className={styles.errorBanner} role="alert">
            {error}
          </p>
        )}

        {/* ══ Section: اطلاعات اصلی ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>اطلاعات اصلی</span>

          <Input
            label="نام دسته‌بندی"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="شناسه URL"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            dir="ltr"
            placeholder="مثال: hot-drinks"
            helper="فقط حروف کوچک انگلیسی، اعداد و خط‌تیره"
          />
        </div>

        {/* ══ Section: تصویر ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>تصویر</span>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            id="cat-image-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={handleImageChange}
            aria-label="انتخاب فایل تصویر"
          />

          {previewSrc ? (
            /* ── Has image: preview + overlay edit button ── */
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
            /* ── No image: large tap-target upload zone ── */
            <label
              htmlFor="cat-image-input"
              className={styles.imageUploadZone}
              aria-label="انتخاب تصویر دسته‌بندی"
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

        {/* ══ Section: تنظیمات نمایش ══ */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>تنظیمات نمایش</span>

          {/* Layout width picker */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>عرض نمایش در صفحه اصلی</span>
            <div className={styles.layoutRow}>
              {(
                [
                  { value: '1col', label: 'عرض کامل', preview: 'full' },
                  { value: '2col', label: 'نیمه عرض', preview: 'half' },
                ] as const
              ).map(({ value, label, preview }) => (
                <label
                  key={value}
                  className={`${styles.layoutOption} ${layoutWidth === value ? styles.layoutSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="layoutWidth"
                    value={value}
                    checked={layoutWidth === value}
                    onChange={() => setLayoutWidth(value)}
                    className={styles.radioHidden}
                  />
                  <span className={styles.layoutPreview} aria-hidden="true">
                    {preview === 'full' ? (
                      <span className={styles.layoutBar} />
                    ) : (
                      <>
                        <span className={styles.layoutBar} />
                        <span className={styles.layoutBar} />
                      </>
                    )}
                  </span>
                  <span className={styles.layoutLabel}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort order + Active toggle — side by side */}
          <div className={styles.settingsRow}>
            <Input
              label="ترتیب نمایش"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              dir="ltr"
            />

            <div className={styles.activeField}>
              <span className={styles.fieldLabel}>وضعیت نمایش</span>
              <div className={styles.activeControl}>
                <label className={styles.toggleWrapper} dir="ltr">
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    aria-label="وضعیت دسته‌بندی"
                  />
                  <span className={styles.toggleTrack} aria-hidden="true" />
                </label>
                <span className={styles.toggleText}>
                  {isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <Button type="submit" fullWidth loading={loading} className={styles.submitBtn}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
        </Button>

      </form>
    </Modal>
  );
}
