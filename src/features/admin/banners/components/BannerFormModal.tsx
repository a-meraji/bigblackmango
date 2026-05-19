import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { uploadImage } from '@api/uploads';
import type { AdminBanner, AdminPartyServicePage } from '@types/admin-content';
import type { BannerPayload } from '@api/admin/banners';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './BannerFormModal.module.css';

interface BannerFormModalProps {
  initial: AdminBanner | null;
  services: AdminPartyServicePage[];
  onClose: () => void;
  onSave: (payload: Partial<BannerPayload>) => Promise<void>;
}

export default function BannerFormModal({
  initial,
  services,
  onClose,
  onSave,
}: BannerFormModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [servicePageId, setServicePageId] = useState(initial?.servicePage.id ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const preview = resolveMediaUrl(imageUrl);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    if (!imageUrl.trim()) e.imageUrl = 'تصویر الزامی است';
    if (!servicePageId) e.servicePageId = 'صفحه سرویس را انتخاب کنید';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadImage(file, 'banners'));
    } catch {
      setErrors((p) => ({ ...p, imageUrl: 'آپلود ناموفق بود.' }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        imageUrl: imageUrl.trim(),
        sortOrder: Number(sortOrder) || 0,
        servicePageId,
        isActive,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={initial ? 'ویرایش بنر' : 'بنر جدید'} size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="عنوان"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          error={errors.title}
          required
        />
        <Input
          label="زیرعنوان"
          value={subtitle}
          onChange={(ev) => setSubtitle(ev.target.value)}
        />
        <div className={styles.imageBlock}>
          <Input
            label="آدرس تصویر"
            value={imageUrl}
            onChange={(ev) => setImageUrl(ev.target.value)}
            error={errors.imageUrl}
            dir="ltr"
            required
          />
          <div className={styles.uploadRow}>
            {preview && <img src={preview} alt="" className={styles.preview} loading="lazy" />}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              آپلود تصویر
            </Button>
          </div>
        </div>
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
          <select
            id="banner-service"
            className={styles.select}
            value={servicePageId}
            onChange={(ev) => setServicePageId(ev.target.value)}
          >
            <option value="">انتخاب کنید</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
                {!s.isActive ? ' (غیرفعال)' : ''}
              </option>
            ))}
          </select>
          {errors.servicePageId && (
            <span className={styles.fieldError}>{errors.servicePageId}</span>
          )}
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(ev) => setIsActive(ev.target.checked)}
          />
          فعال (نمایش در کاروسل)
        </label>
        <Button type="submit" fullWidth loading={loading}>
          {initial ? 'ذخیره تغییرات' : 'ایجاد بنر'}
        </Button>
      </form>
    </Modal>
  );
}
