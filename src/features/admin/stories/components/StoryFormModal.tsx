import { useRef, useState } from 'react';
import { useScrollToFormFieldErrors } from '@hooks/useScrollToFormFieldErrors';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import { MediaPickerField } from '@components/media-picker';
import { adminCreateStory, adminUpdateStory } from '@api/admin/stories';
import type { StoryPayload } from '@api/admin/stories';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminStory } from '@t/admin-content';
import { JalaliDateTimePicker } from '@components/jalali-date-picker';
import { defaultStoryExpiryIso } from '@utils/locale';
import styles from './StoryFormModal.module.css';

interface StoryFormModalProps {
  initial?: AdminStory | null;
  onClose: () => void;
}

function isExpired(story: AdminStory): boolean {
  return new Date(story.expiresAt) < new Date();
}

export default function StoryFormModal({ initial = null, onClose }: StoryFormModalProps) {
  const isEdit = !!initial;
  const isReactivating = isEdit && (isExpired(initial) || !initial.isActive);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [mediaType, setMediaType] = useState<'image' | 'video'>(initial?.mediaType ?? 'image');
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '');
  const [expiresAt, setExpiresAt] = useState(
    initial && !isExpired(initial) ? initial.expiresAt : defaultStoryExpiryIso(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useScrollToFormFieldErrors(formRef, errors);

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<StoryPayload>({
    entity: 'story',
    isEdit,
    recordId: initial?.id,
    createFn: adminCreateStory,
    updateFn: adminUpdateStory,
    invalidateKeys: [['admin', 'stories']],
    messages: {
      create: 'استوری ایجاد شد.',
      update: isReactivating ? 'استوری دوباره فعال شد.' : 'استوری بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!mediaUrl.trim()) e.mediaUrl = 'رسانه الزامی است';
    if (new Date(expiresAt) <= new Date()) {
      e.expiresAt = 'تاریخ انقضا باید در آینده باشد.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await submit({
      title: title.trim() || undefined,
      mediaType,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      expiresAt,
      isActive: true,
    });
  }

  const modalTitle = isReactivating
    ? 'فعال‌سازی مجدد استوری'
    : isEdit
      ? 'ویرایش استوری'
      : 'استوری جدید';

  const submitLabel = isReactivating
    ? 'فعال‌سازی مجدد'
    : isEdit
      ? 'ذخیره تغییرات'
      : 'ایجاد استوری';

  return (
    <Modal isOpen onClose={onClose} title={modalTitle} preventClose={loading}>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <FormErrorBanner message={submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <Input
            label="عنوان"
            value={title}
            onChange={(ev) => { setTitle(ev.target.value); clearSubmitError(); }}
          />

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>نوع رسانه</legend>
            <div className={styles.radios}>
              {(['image', 'video'] as const).map((t) => (
                <label key={t} className={styles.radio}>
                  <input
                    type="radio"
                    name="mediaType"
                    value={t}
                    checked={mediaType === t}
                    onChange={() => setMediaType(t)}
                  />
                  {t === 'image' ? 'تصویر' : 'ویدیو'}
                </label>
              ))}
            </div>
          </fieldset>

          <MediaPickerField
            label="رسانه استوری"
            value={mediaUrl}
            onChange={setMediaUrl}
            onTypeChange={(type) => setMediaType(type)}
            allowedTypes={mediaType}
            valueType={mediaType}
            uploadFolder="stories"
            error={errors.mediaUrl}
            required
            allowUrlInput
            previewAlt={title || 'پیش‌نمایش استوری'}
          />

          <MediaPickerField
            label="تصویر بندانگشتی (اختیاری)"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            allowedTypes="image"
            uploadFolder="stories"
            error={errors.thumbnailUrl}
            allowUrlInput
            previewAlt="بندانگشتی استوری"
          />

          <div>
            <JalaliDateTimePicker
              id="story-expires"
              label="تاریخ انقضا"
              value={expiresAt}
              onChange={(value) => {
                setExpiresAt(value);
                clearSubmitError();
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.expiresAt;
                  return next;
                });
              }}
            />
            {errors.expiresAt && (
              <p className={styles.fieldError} role="alert">
                {errors.expiresAt}
              </p>
            )}
          </div>
        </fieldset>

        <Button type="submit" fullWidth loading={loading} className={styles.submit}>
          {submitLabel}
        </Button>
      </form>
    </Modal>
  );
}
