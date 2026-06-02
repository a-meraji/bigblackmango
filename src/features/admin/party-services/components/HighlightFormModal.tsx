import { useRef, useState } from 'react';
import Modal from '@components/modal/Modal';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { uploadImage, uploadVideo, checkVideoDuration } from '@api/uploads';
import type { AdminPartyServiceHighlight } from '@t/admin-content';
import type { PartyServiceHighlightPayload } from '@api/admin/party-service-highlights';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './HighlightFormModal.module.css';

interface HighlightFormModalProps {
  servicePageId: string;
  initial: AdminPartyServiceHighlight | null;
  onClose: () => void;
  onSave: (payload: Partial<PartyServiceHighlightPayload>) => Promise<void>;
}

const MAX_DURATION_SEC = 60;

export default function HighlightFormModal({
  servicePageId,
  initial,
  onClose,
  onSave,
}: HighlightFormModalProps) {
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const thumbPreview = resolveMediaUrl(thumbnailUrl);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'عنوان الزامی است';
    if (!videoUrl.trim()) e.videoUrl = 'ویدیو الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors((p) => ({ ...p, videoUrl: '' }));
    setUploadingVideo(true);

    try {
      const duration = await checkVideoDuration(file);
      if (duration > MAX_DURATION_SEC) {
        setErrors((p) => ({
          ...p,
          videoUrl: `مدت ویدیو نباید بیشتر از ${MAX_DURATION_SEC} ثانیه باشد (مدت فعلی: ${Math.round(duration)} ثانیه)`,
        }));
        return;
      }
      const path = await uploadVideo(file, 'party-service-highlights');
      setVideoUrl(path);
    } catch {
      setErrors((p) => ({ ...p, videoUrl: 'آپلود ویدیو ناموفق بود.' }));
    } finally {
      setUploadingVideo(false);
      if (videoFileRef.current) videoFileRef.current.value = '';
    }
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const path = await uploadImage(file, 'party-services');
      setThumbnailUrl(path);
    } catch {
      setErrors((p) => ({ ...p, thumbnailUrl: 'آپلود تصویر ناموفق بود.' }));
    } finally {
      setUploadingThumb(false);
      if (thumbFileRef.current) thumbFileRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        servicePageId,
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        sortOrder,
        isActive,
      });
    } finally {
      setLoading(false);
    }
  }

  const resolvedVideo = resolveMediaUrl(videoUrl);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={initial ? 'ویرایش هایلایت' : 'هایلایت جدید'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="عنوان هایلایت"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          error={errors.title}
          required
        />

        <div className={styles.videoBlock}>
          <span className={styles.label}>ویدیو (حداکثر ۶۰ ثانیه)</span>
          <div className={styles.uploadRow}>
            <input
              ref={videoFileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className={styles.fileInput}
              onChange={handleVideoUpload}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploadingVideo}
              onClick={() => videoFileRef.current?.click()}
            >
              آپلود ویدیو
            </Button>
            {videoUrl && !uploadingVideo && (
              <span className={styles.uploadedBadge}>✓ آپلود شد</span>
            )}
          </div>
          {errors.videoUrl && (
            <span className={styles.fieldError}>{errors.videoUrl}</span>
          )}
          {resolvedVideo && (
            <video
              src={resolvedVideo}
              className={styles.videoPreview}
              controls
              preload="metadata"
            />
          )}
        </div>

        <div className={styles.thumbBlock}>
          <span className={styles.label}>تصویر بندانگشتی (اختیاری)</span>
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
              آپلود تصویر
            </Button>
            {thumbPreview && (
              <img
                src={thumbPreview}
                alt=""
                className={styles.thumbPreview}
                loading="lazy"
              />
            )}
          </div>
          {errors.thumbnailUrl && (
            <span className={styles.fieldError}>{errors.thumbnailUrl}</span>
          )}
        </div>

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

        <Button type="submit" fullWidth loading={loading}>
          {initial ? 'ذخیره تغییرات' : 'ایجاد هایلایت'}
        </Button>
      </form>
    </Modal>
  );
}
