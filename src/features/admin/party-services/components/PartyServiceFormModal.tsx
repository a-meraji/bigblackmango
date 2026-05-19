import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FaqEditor from './FaqEditor';
import GalleryEditor from './GalleryEditor';
import TagInput from '@features/admin/foods/components/TagInput';
import { uploadImage } from '@api/uploads';
import type { AdminPartyServicePage } from '@types/admin-content';
import type { FaqItem } from '@types/party-service';
import type { PartyServicePayload } from '@api/admin/party-services';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './PartyServiceFormModal.module.css';

interface PartyServiceFormModalProps {
  initial: AdminPartyServicePage | null;
  onClose: () => void;
  onSave: (payload: Partial<PartyServicePayload>) => Promise<void>;
}

export default function PartyServiceFormModal({
  initial,
  onClose,
  onSave,
}: PartyServiceFormModalProps) {
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? '');
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [serviceItems, setServiceItems] = useState<string[]>(initial?.serviceItems ?? []);
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const heroPreview = resolveMediaUrl(heroImageUrl);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    if (!contactPhone.trim()) e.contactPhone = 'تلفن الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      setHeroImageUrl(await uploadImage(file, 'party-services'));
    } catch {
      setErrors((p) => ({ ...p, heroImageUrl: 'آپلود ناموفق بود.' }));
    } finally {
      setUploadingHero(false);
      if (heroFileRef.current) heroFileRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const filteredFaq = faq.filter((f) => f.question.trim() && f.answer.trim());
      await onSave({
        title: title.trim(),
        heroImageUrl: heroImageUrl.trim() || undefined,
        gallery,
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
        serviceItems,
        faq: filteredFaq,
        contactPhone: contactPhone.trim(),
        isActive,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={initial ? 'ویرایش سرویس' : 'سرویس جدید'} size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="عنوان سرویس"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          error={errors.title}
          required
        />
        <div className={styles.heroBlock}>
          <Input
            label="تصویر اصلی (Hero URL)"
            value={heroImageUrl}
            onChange={(ev) => setHeroImageUrl(ev.target.value)}
            error={errors.heroImageUrl}
            dir="ltr"
          />
          <div className={styles.uploadRow}>
            {heroPreview && <img src={heroPreview} alt="" className={styles.heroPreview} loading="lazy" />}
            <input
              ref={heroFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              onChange={handleHeroUpload}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploadingHero}
              onClick={() => heroFileRef.current?.click()}
            >
              آپلود Hero
            </Button>
          </div>
        </div>
        <GalleryEditor gallery={gallery} onChange={setGallery} />
        <div>
          <label className={styles.sectionLabel} htmlFor="service-summary">
            خلاصه
          </label>
          <textarea
            id="service-summary"
            className={styles.textarea}
            value={summary}
            onChange={(ev) => setSummary(ev.target.value)}
            rows={2}
          />
        </div>
        <div>
          <label className={styles.sectionLabel} htmlFor="service-description">
            توضیحات کامل
          </label>
          <textarea
            id="service-description"
            className={styles.textarea}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={5}
          />
        </div>
        <TagInput
          label="موارد خدماتی (مثلاً: فینگر فود، کیک)"
          tags={serviceItems}
          onChange={setServiceItems}
        />
        <FaqEditor faq={faq} onChange={setFaq} />
        <Input
          label="تلفن تماس"
          value={contactPhone}
          onChange={(ev) => setContactPhone(ev.target.value)}
          error={errors.contactPhone}
          dir="ltr"
          required
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
          {initial ? 'ذخیره تغییرات' : 'ایجاد سرویس'}
        </Button>
      </form>
    </Modal>
  );
}
