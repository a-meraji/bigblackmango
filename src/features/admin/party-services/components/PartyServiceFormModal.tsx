import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import IconPicker from '@components/icon-picker/IconPicker';
import FaqEditor from './FaqEditor';
import GalleryEditor from './GalleryEditor';
import { uploadImage } from '@api/uploads';
import type { AdminPartyServicePage } from '@t/admin-content';
import type { FaqItem, ServiceStat } from '@t/party-service';
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
  const [stats, setStats] = useState<ServiceStat[]>(initial?.stats ?? []);
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

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

  function addStat() {
    setStats((s) => [...s, { label: '', value: '', icon: null }]);
  }

  function removeStat(i: number) {
    setStats((s) => s.filter((_, idx) => idx !== i));
  }

  function updateStat(i: number, field: 'label' | 'value', val: string) {
    setStats((s) => s.map((stat, idx) => idx === i ? { ...stat, [field]: val } : stat));
  }

  function updateStatIcon(i: number, iconName: string | null) {
    setStats((s) => s.map((stat, idx) => idx === i ? { ...stat, icon: iconName } : stat));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const filteredFaq = faq.filter((f) => f.question.trim() && f.answer.trim());
      const filteredStats = stats.filter((s) => s.label.trim() && s.value.trim());
      await onSave({
        title: title.trim(),
        heroImageUrl: heroImageUrl.trim() || undefined,
        gallery,
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
        stats: filteredStats,
        faq: filteredFaq,
        contactPhone: contactPhone.trim(),
        isActive,
      });
    } catch {
      setApiError('خطا در ذخیره‌سازی. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره امتحان کنید.');
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
          <label className={styles.sectionLabel} htmlFor="service-summary">خلاصه</label>
          <textarea
            id="service-summary"
            className={styles.textarea}
            value={summary}
            onChange={(ev) => setSummary(ev.target.value)}
            rows={2}
          />
        </div>
        <div>
          <label className={styles.sectionLabel} htmlFor="service-description">توضیحات کامل</label>
          <textarea
            id="service-description"
            className={styles.textarea}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={4}
          />
        </div>

        {/* Stats editor */}
        <div className={styles.statsBlock}>
          <div className={styles.statsHeader}>
            <span className={styles.sectionLabel}>آمار و ارقام (اختیاری)</span>
            <button type="button" className={styles.addStatBtn} onClick={addStat}>
              + افزودن آمار
            </button>
          </div>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statRow}>
              <input
                className={styles.statInput}
                value={stat.value}
                onChange={(e) => updateStat(i, 'value', e.target.value)}
                placeholder="مقدار (مثلاً: ۵۰۰+)"
              />
              <input
                className={styles.statInput}
                value={stat.label}
                onChange={(e) => updateStat(i, 'label', e.target.value)}
                placeholder="عنوان (مثلاً: رویداد برگزار شده)"
              />
              <div className={styles.statIconPicker}>
                <IconPicker
                  label=""
                  value={stat.icon ?? null}
                  onChange={(v) => updateStatIcon(i, v)}
                />
              </div>
              <div className={styles.statRowActions}>
                <button
                  type="button"
                  className={styles.removeStatBtn}
                  onClick={() => removeStat(i)}
                  aria-label="حذف آمار"
                >
                  × حذف
                </button>
              </div>
            </div>
          ))}
        </div>

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
        {apiError && (
          <div className={styles.apiError} role="alert">
            {apiError}
          </div>
        )}
        <Button type="submit" fullWidth loading={loading}>
          {initial ? 'ذخیره تغییرات' : 'ایجاد سرویس'}
        </Button>
      </form>
    </Modal>
  );
}
