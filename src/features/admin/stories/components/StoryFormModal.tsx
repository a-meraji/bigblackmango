import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { uploadImage } from '@api/uploads';
import type { StoryPayload } from '@api/admin/stories';
import { defaultStoryExpiryLocal } from '@utils/datetime-local';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './StoryFormModal.module.css';

interface StoryFormModalProps {
  onClose: () => void;
  onSave: (payload: StoryPayload) => Promise<void>;
}

export default function StoryFormModal({ onClose, onSave }: StoryFormModalProps) {
  const mediaFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultStoryExpiryLocal());
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const thumbPreview = resolveMediaUrl(thumbnailUrl || mediaUrl);

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mediaType === 'video') {
      setErrors((p) => ({
        ...p,
        mediaUrl: 'برای ویدیو آدرس URL را وارد کنید؛ آپلود فایل ویدیو پشتیبانی نمی‌شود.',
      }));
      return;
    }
    setUploadingMedia(true);
    try {
      const url = await uploadImage(file, 'stories');
      setMediaUrl(url);
      if (!thumbnailUrl) setThumbnailUrl(url);
    } catch {
      setErrors((p) => ({ ...p, mediaUrl: 'آپلود ناموفق بود.' }));
    } finally {
      setUploadingMedia(false);
      if (mediaFileRef.current) mediaFileRef.current.value = '';
    }
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadImage(file, 'stories');
      setThumbnailUrl(url);
    } catch {
      setErrors((p) => ({ ...p, thumbnailUrl: 'آپلود ناموفق بود.' }));
    } finally {
      setUploadingThumb(false);
      if (thumbFileRef.current) thumbFileRef.current.value = '';
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!mediaUrl.trim()) e.mediaUrl = 'آدرس رسانه الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        title: title.trim() || undefined,
        mediaType,
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        expiresAt: new Date(expiresAt).toISOString(),
        isActive: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="استوری جدید">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input label="عنوان" value={title} onChange={(ev) => setTitle(ev.target.value)} />

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

        <Input
          label="آدرس رسانه (URL)"
          value={mediaUrl}
          onChange={(ev) => setMediaUrl(ev.target.value)}
          error={errors.mediaUrl}
          required
          dir="ltr"
        />
        {mediaType === 'image' && (
          <div className={styles.uploadRow}>
            <input
              ref={mediaFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              onChange={handleMediaUpload}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploadingMedia}
              onClick={() => mediaFileRef.current?.click()}
            >
              آپلود رسانه
            </Button>
          </div>
        )}

        <Input
          label="آدرس تصویر بندانگشتی (اختیاری)"
          value={thumbnailUrl}
          onChange={(ev) => setThumbnailUrl(ev.target.value)}
          error={errors.thumbnailUrl}
          dir="ltr"
        />
        <div className={styles.uploadRow}>
          <input
            ref={thumbFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={handleThumbUpload}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={uploadingThumb}
            onClick={() => thumbFileRef.current?.click()}
          >
            آپلود بندانگشتی
          </Button>
          {thumbPreview && (
            <img src={thumbPreview} alt="" className={styles.preview} loading="lazy" />
          )}
        </div>

        <div>
          <label className={styles.datetimeLabel} htmlFor="story-expires">
            تاریخ انقضا
          </label>
          <input
            id="story-expires"
            type="datetime-local"
            className={styles.datetime}
            value={expiresAt}
            onChange={(ev) => setExpiresAt(ev.target.value)}
          />
        </div>

        <Button type="submit" fullWidth loading={loading} className={styles.submit}>
          ایجاد استوری
        </Button>
      </form>
    </Modal>
  );
}
