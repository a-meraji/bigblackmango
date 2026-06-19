import { useRef, useState } from 'react';
import { useScrollToFormFieldErrors } from '@hooks/useScrollToFormFieldErrors';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import FormErrorBanner from '@components/form-error-banner/FormErrorBanner';
import { MediaPickerField } from '@components/media-picker';
import {
  adminCreateHighlight,
  adminUpdateHighlight,
} from '@api/admin/party-service-highlights';
import type { PartyServiceHighlightPayload } from '@api/admin/party-service-highlights';
import { useAdminEntityForm } from '@hooks/useAdminEntityForm';
import type { AdminPartyServiceHighlight } from '@t/admin-content';
import styles from './HighlightFormModal.module.css';

interface HighlightFormModalProps {
  servicePageId: string;
  initial: AdminPartyServiceHighlight | null;
  onClose: () => void;
}

const MAX_DURATION_SEC = 60;

export default function HighlightFormModal({
  servicePageId,
  initial,
  onClose,
}: HighlightFormModalProps) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    initial?.mediaType ?? 'video',
  );
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useScrollToFormFieldErrors(formRef, errors);

  const { submit, loading, submitError, clearSubmitError } = useAdminEntityForm<
    Partial<PartyServiceHighlightPayload>
  >({
    entity: 'highlight',
    isEdit,
    recordId: initial?.id,
    createFn: (payload) =>
      adminCreateHighlight(payload as PartyServiceHighlightPayload),
    updateFn: (id, payload) => {
      const { servicePageId: _sid, ...updatePayload } = payload;
      return adminUpdateHighlight(id, updatePayload);
    },
    invalidateKeys: [['admin', 'highlights', servicePageId]],
    messages: {
      create: 'هایلایت ایجاد شد.',
      update: 'هایلایت بروزرسانی شد.',
    },
    onSuccess: onClose,
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    if (!mediaUrl.trim()) e.mediaUrl = 'رسانه الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await submit({
      servicePageId,
      title: title.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      sortOrder,
      isActive,
    });
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش هایلایت' : 'هایلایت جدید'}
      size="lg"
      preventClose={loading}
    >
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <FormErrorBanner message={submitError} />

        <fieldset disabled={loading} className={styles.fieldsetBody}>
          <Input
            label="عنوان هایلایت"
            value={title}
            onChange={(ev) => { setTitle(ev.target.value); clearSubmitError(); }}
            error={errors.title}
            required
          />

          <fieldset className={styles.mediaTypeFieldset}>
            <legend className={styles.label}>نوع رسانه</legend>
            <div className={styles.mediaTypeRadios}>
              {(['image', 'video'] as const).map((t) => (
                <label key={t} className={styles.mediaTypeRadio}>
                  <input
                    type="radio"
                    name="highlightMediaType"
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
            label={mediaType === 'video' ? 'ویدیو (حداکثر ۶۰ ثانیه)' : 'تصویر هایلایت'}
            value={mediaUrl}
            onChange={setMediaUrl}
            onTypeChange={(type) => setMediaType(type)}
            allowedTypes={mediaType}
            valueType={mediaType}
            uploadFolder="party-service-highlights"
            error={errors.mediaUrl}
            required
            maxVideoDurationSec={mediaType === 'video' ? MAX_DURATION_SEC : undefined}
            previewAlt={title || 'پیش‌نمایش هایلایت'}
          />

          <MediaPickerField
            label="تصویر بندانگشتی (اختیاری)"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            allowedTypes="image"
            uploadFolder="party-services"
            error={errors.thumbnailUrl}
            previewAlt="بندانگشتی هایلایت"
          />

          <div className={styles.row}>
            <Input
              label="ترتیب نمایش"
              type="number"
              value={String(sortOrder)}
              onChange={(ev) => setSortOrder(Number(ev.target.value))}
              dir="ltr"
            />
          </div>

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
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد هایلایت'}
        </Button>
      </form>
    </Modal>
  );
}
