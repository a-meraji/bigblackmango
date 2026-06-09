import { useRef, useState } from 'react';
import { useScrollToFormFieldErrors } from '@hooks/useScrollToFormFieldErrors';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import IconPicker from '@components/icon-picker/IconPicker';
import GalleryEditor from './GalleryEditor';
import TagInput from '@features/admin/foods/components/TagInput';
import {
  adminCreateServiceItem,
  adminUpdateServiceItem,
} from '@api/admin/service-items';
import type { ServiceItemPayload } from '@api/admin/service-items';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminServiceItem } from '@t/admin-content';
import styles from './ServiceItemFormModal.module.css';

interface Props {
  servicePageId: string;
  initial: AdminServiceItem | null;
  onClose: () => void;
}

export default function ServiceItemFormModal({
  servicePageId,
  initial,
  onClose,
}: Props) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useScrollToFormFieldErrors(formRef, errors);

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<
    Partial<ServiceItemPayload>
  >({
    entity: 'serviceItem',
    isEdit,
    recordId: initial?.id,
    createFn: (payload) => adminCreateServiceItem(payload as ServiceItemPayload),
    updateFn: (id, payload) => {
      const { servicePageId: _sid, ...updatePayload } = payload;
      return adminUpdateServiceItem(id, updatePayload);
    },
    invalidateKeys: [['admin', 'service-items', servicePageId]],
    messages: {
      create: 'خدمت ایجاد شد.',
      update: 'خدمت بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await submit({
      servicePageId,
      title: title.trim(),
      description: description.trim() || undefined,
      gallery,
      features,
      icon: icon.trim() || undefined,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive,
    });
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش خدمت' : 'خدمت جدید'}
      size="lg"
      preventClose={loading}
    >
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <FormErrorBanner message={submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <Input
            label="عنوان خدمت"
            value={title}
            onChange={(ev) => { setTitle(ev.target.value); clearSubmitError(); }}
            error={errors.title}
            required
          />
          <IconPicker label="آیکون (اختیاری)" value={icon || null} onChange={(v) => setIcon(v ?? '')} />
          <div>
            <label className={styles.fieldLabel} htmlFor="item-desc">توضیحات</label>
            <textarea
              id="item-desc"
              className={styles.textarea}
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={4}
              placeholder="توضیح کامل این خدمت..."
            />
          </div>
          <GalleryEditor gallery={gallery} onChange={setGallery} />
          <TagInput
            label="ویژگی‌ها (مثلاً: DJ حرفه‌ای)"
            tags={features}
            onChange={setFeatures}
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
        </fieldset>

        <Button type="submit" fullWidth loading={loading}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد خدمت'}
        </Button>
      </form>
    </Modal>
  );
}
