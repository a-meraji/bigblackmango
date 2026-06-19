import { useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import TagInput from '@features/admin/foods/components/TagInput';
import CustomSelect from '@components/custom-select/CustomSelect';
import { MediaPickerField } from '@components/media-picker';
import { adminCreateFood, adminUpdateFood } from '@api/admin/foods';
import type { FoodPayload } from '@api/admin/foods';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminCategory, AdminFood } from '@t/admin-catalog';
import styles from './FoodFormModal.module.css';

interface FoodFormModalProps {
  initial: AdminFood | null;
  categories: AdminCategory[];
  onClose: () => void;
}

export default function FoodFormModal({
  initial,
  categories,
  onClose,
}: FoodFormModalProps) {
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? '');
  const [shortDesc, setShortDesc] = useState(initial?.shortDescription ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category.id ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<FoodPayload>({
    entity: 'food',
    isEdit,
    recordId: initial?.id,
    createFn: adminCreateFood,
    updateFn: adminUpdateFood,
    invalidateKeys: [['admin', 'foods']],
    messages: {
      create: 'غذا ایجاد شد.',
      update: 'غذا بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('نام غذا الزامی است.');
      return;
    }
    if (!categoryId) {
      setError('دسته‌بندی الزامی است.');
      return;
    }
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError('قیمت معتبر وارد کنید.');
      return;
    }

    setError('');
    await submit({
      name: name.trim(),
      shortDescription: shortDesc.trim() || undefined,
      description: desc.trim() || undefined,
      categoryId,
      price: priceNum,
      imageUrl: imageUrl.trim() || undefined,
      tags,
      isActive,
    });
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش غذا' : 'غذای جدید'}
      size="lg"
      preventClose={loading}
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormErrorBanner message={error || submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>اطلاعات اصلی</span>

            <Input
              label="نام غذا"
              value={name}
              onChange={(e) => { setName(e.target.value); clearSubmitError(); }}
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
                  onChange={(v) => { setCategoryId(v); clearSubmitError(); }}
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

          <div className={styles.section}>
            <MediaPickerField
              label="تصویر غذا"
              value={imageUrl}
              onChange={setImageUrl}
              allowedTypes="image"
              uploadFolder="foods"
              previewAlt={name || 'تصویر غذا'}
            />
          </div>

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
        </fieldset>

        <Button type="submit" fullWidth loading={loading} className={styles.submitBtn}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد غذا'}
        </Button>
      </form>
    </Modal>
  );
}
