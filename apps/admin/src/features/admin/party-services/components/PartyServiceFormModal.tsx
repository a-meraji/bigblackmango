import { useRef, useState } from 'react';
import { useScrollToFormFieldErrors } from '@hooks/useScrollToFormFieldErrors';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import IconPicker from '@components/icon-picker/IconPicker';
import { MediaPickerField } from '@components/media-picker';
import FaqEditor from './FaqEditor';
import GalleryEditor from './GalleryEditor';
import {
  adminCreatePartyService,
  adminUpdatePartyService,
} from '@api/admin/party-services';
import type { PartyServicePayload } from '@api/admin/party-services';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminPartyServicePage } from '@t/admin-content';
import type { FaqItem, ServiceStat } from '@t/party-service';
import styles from './PartyServiceFormModal.module.css';

interface PartyServiceFormModalProps {
  initial: AdminPartyServicePage | null;
  onClose: () => void;
}

export default function PartyServiceFormModal({
  initial,
  onClose,
}: PartyServiceFormModalProps) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? '');
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [stats, setStats] = useState<ServiceStat[]>(initial?.stats ?? []);
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useScrollToFormFieldErrors(formRef, errors);

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<
    Partial<PartyServicePayload>
  >({
    entity: 'partyService',
    isEdit,
    recordId: initial?.id,
    createFn: (payload) => adminCreatePartyService(payload as PartyServicePayload),
    updateFn: adminUpdatePartyService,
    invalidateKeys: [['admin', 'party-services']],
    messages: {
      create: 'سرویس ایجاد شد.',
      update: 'سرویس بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    if (!contactPhone.trim()) e.contactPhone = 'تلفن الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
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

    const filteredFaq = faq.filter((f) => f.question.trim() && f.answer.trim());
    const filteredStats = stats.filter((s) => s.label.trim() && s.value.trim());

    await submit({
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
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش سرویس' : 'سرویس جدید'}
      size="lg"
      preventClose={loading}
    >
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <FormErrorBanner message={submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <Input
            label="عنوان سرویس"
            value={title}
            onChange={(ev) => { setTitle(ev.target.value); clearSubmitError(); }}
            error={errors.title}
            required
          />
          <MediaPickerField
            label="تصویر اصلی (Hero)"
            value={heroImageUrl}
            onChange={setHeroImageUrl}
            allowedTypes="image"
            uploadFolder="party-services"
            error={errors.heroImageUrl}
            allowUrlInput
            previewAlt={title || 'تصویر Hero'}
          />
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

          <div className={styles.statsBlock}>
            <div className={styles.statsHeader}>
              <span className={styles.sectionLabel}>آمار و ارقام (اختیاری)</span>
              <button type="button" className={styles.addStatBtn} onClick={addStat}>
                + افزودن آمار
              </button>
            </div>
            {stats.map((stat, i) => (
              <div key={i} className={styles.statRow}>
                <RawLocalizedInput
                  className={styles.statInput}
                  value={stat.value}
                  onChange={(v) => updateStat(i, 'value', v)}
                  placeholder="مقدار (مثلاً: ۵۰۰+)"
                />
                <RawLocalizedInput
                  className={styles.statInput}
                  value={stat.label}
                  onChange={(v) => updateStat(i, 'label', v)}
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
            onChange={(ev) => { setContactPhone(ev.target.value); clearSubmitError(); }}
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
        </fieldset>

        <Button type="submit" fullWidth loading={loading}>
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد سرویس'}
        </Button>
      </form>
    </Modal>
  );
}
