import { useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import IconPicker from '@components/icon-picker/IconPicker';
import GalleryEditor from './GalleryEditor';
import TagInput from '@features/admin/foods/components/TagInput';
import type { AdminServiceItem } from '@t/admin-content';
import type { ServiceItemPayload } from '@api/admin/service-items';
import styles from './ServiceItemFormModal.module.css';

interface Props {
  servicePageId: string;
  initial: AdminServiceItem | null;
  onClose: () => void;
  onSave: (payload: Partial<ServiceItemPayload>) => Promise<void>;
}

export default function ServiceItemFormModal({ servicePageId, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await onSave({
        servicePageId,
        title: title.trim(),
        description: description.trim() || undefined,
        gallery,
        features,
        icon: icon.trim() || undefined,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive,
      });
    } catch {
      setApiError('خطا در ذخیره‌سازی. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره امتحان کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={initial ? 'ویرایش خدمت' : 'خدمت جدید'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="عنوان خدمت"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
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
        {apiError && (
          <div className={styles.apiError} role="alert">
            {apiError}
          </div>
        )}
        <Button type="submit" fullWidth loading={loading}>
          {initial ? 'ذخیره تغییرات' : 'ایجاد خدمت'}
        </Button>
      </form>
    </Modal>
  );
}
