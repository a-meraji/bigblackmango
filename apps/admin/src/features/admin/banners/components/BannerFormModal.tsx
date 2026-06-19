import { useRef, useState } from 'react';
import { useScrollToFormFieldErrors } from '@hooks/useScrollToFormFieldErrors';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import CustomSelect from '@components/custom-select/CustomSelect';
import { MediaPickerField } from '@components/media-picker';
import { adminCreateBanner, adminUpdateBanner } from '@api/admin/banners';
import type { BannerPayload } from '@api/admin/banners';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminBanner, AdminPartyServicePage } from '@t/admin-content';
import styles from './BannerFormModal.module.css';

interface BannerFormModalProps {
  initial: AdminBanner | null;
  services: AdminPartyServicePage[];
  onClose: () => void;
}

export default function BannerFormModal({
  initial,
  services,
  onClose,
}: BannerFormModalProps) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [servicePageId, setServicePageId] = useState(initial?.servicePage.id ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useScrollToFormFieldErrors(formRef, errors);

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<
    Partial<BannerPayload>
  >({
    entity: 'banner',
    isEdit,
    recordId: initial?.id,
    createFn: (payload) => adminCreateBanner(payload as BannerPayload),
    updateFn: adminUpdateBanner,
    invalidateKeys: [['admin', 'banners']],
    messages: {
      create: 'بنر ایجاد شد.',
      update: 'بنر بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    if (!imageUrl.trim()) e.imageUrl = 'تصویر الزامی است';
    if (!servicePageId) e.servicePageId = 'صفحه سرویس را انتخاب کنید';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await submit({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      imageUrl: imageUrl.trim(),
      sortOrder: Number(sortOrder) || 0,
      servicePageId,
      isActive,
    });
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش بنر' : 'بنر جدید'}
      size="lg"
      preventClose={loading}
    >
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <FormErrorBanner message={submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <Input
            label="عنوان"
            value={title}
            onChange={(ev) => { setTitle(ev.target.value); clearSubmitError(); }}
            error={errors.title}
            required
          />
          <Input
            label="زیرعنوان"
            value={subtitle}
            onChange={(ev) => setSubtitle(ev.target.value)}
          />
          <MediaPickerField
            label="تصویر بنر"
            value={imageUrl}
            onChange={setImageUrl}
            allowedTypes="image"
            uploadFolder="banners"
            error={errors.imageUrl}
            required
            allowUrlInput
            previewAlt={title || 'تصویر بنر'}
          />
          <Input
            label="ترتیب نمایش"
            type="number"
            value={sortOrder}
            onChange={(ev) => setSortOrder(ev.target.value)}
            dir="ltr"
          />
          <div>
            <label className={styles.selectLabel} htmlFor="banner-service">
              صفحه سرویس *
            </label>
            <CustomSelect
              id="banner-service"
              value={servicePageId}
              onChange={(v) => { setServicePageId(v); clearSubmitError(); }}
              placeholder="انتخاب کنید"
              error={errors.servicePageId}
              options={services.map((s) => ({
                value: s.id,
                label: s.isActive ? s.title : `${s.title} (غیرفعال)`,
              }))}
            />
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(ev) => setIsActive(ev.target.checked)}
            />
            فعال (نمایش در کاروسل)
          </label>
        </fieldset>

        <Button type="submit" fullWidth loading={loading}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد بنر'}
        </Button>
      </form>
    </Modal>
  );
}
