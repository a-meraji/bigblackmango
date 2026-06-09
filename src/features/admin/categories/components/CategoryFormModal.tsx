import { useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import { MediaPickerField } from '@components/media-picker';
import { adminCreateCategory, adminUpdateCategory } from '@api/admin/categories';
import type { CategoryPayload } from '@api/admin/categories';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminCategory } from '@t/admin-catalog';
import styles from './CategoryFormModal.module.css';

interface CategoryFormModalProps {
  initial: AdminCategory | null;
  onClose: () => void;
}

export default function CategoryFormModal({ initial, onClose }: CategoryFormModalProps) {
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [layoutWidth, setLayoutWidth] = useState<'1col' | '2col'>(initial?.layoutWidth ?? '1col');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<CategoryPayload>({
    entity: 'category',
    isEdit,
    recordId: initial?.id,
    createFn: adminCreateCategory,
    updateFn: adminUpdateCategory,
    invalidateKeys: [['admin', 'categories']],
    messages: {
      create: 'دسته‌بندی ایجاد شد.',
      update: 'دسته‌بندی بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  async function save() {
    if (!name.trim()) {
      setError('نام دسته‌بندی الزامی است.');
      return;
    }

    const slugVal = slug.trim();
    if (slugVal && !/^[a-z0-9-]+$/.test(slugVal)) {
      setError('شناسه URL فقط شامل حروف کوچک انگلیسی، اعداد و خط‌تیره می‌شود.');
      return;
    }

    const order = Number(sortOrder);
    if (Number.isNaN(order)) {
      setError('ترتیب نمایش معتبر نیست.');
      return;
    }

    setError('');
    await submit({
      name: name.trim(),
      slug: slugVal || undefined,
      imageUrl: imageUrl.trim() || undefined,
      layoutWidth,
      sortOrder: order,
      isActive,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void save();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
      size="lg"
      preventClose={loading}
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormErrorBanner message={error || submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>اطلاعات اصلی</span>

            <Input
              label="نام دسته‌بندی"
              value={name}
              onChange={(e) => { setName(e.target.value); clearSubmitError(); }}
              required
              autoFocus
            />

            <Input
              label="شناسه URL"
              value={slug}
              onChange={(e) => { setSlug(e.target.value.toLowerCase()); clearSubmitError(); }}
              dir="ltr"
              placeholder="مثال: hot-drinks"
              helper="فقط حروف کوچک انگلیسی، اعداد و خط‌تیره"
            />
          </div>

          <div className={styles.section}>
            <MediaPickerField
              label="تصویر دسته‌بندی"
              value={imageUrl}
              onChange={setImageUrl}
              allowedTypes="image"
              uploadFolder="categories"
              previewAlt={name || 'تصویر دسته‌بندی'}
            />
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>تنظیمات نمایش</span>

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
        </fieldset>

        <Button
          type="button"
          fullWidth
          loading={loading}
          className={styles.submitBtn}
          onClick={() => void save()}
        >
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
        </Button>
      </form>
    </Modal>
  );
}
