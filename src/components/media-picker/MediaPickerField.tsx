import { useState } from 'react';
import Button from '@components/button/Button';
import Input from '@components/input/Input';
import { useMediaUpload } from '@hooks/useMediaUpload';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import type { UploadFolder } from '@api/uploads';
import type { MediaAsset, MediaAssetType } from '@t/media';
import MediaLibraryModal from './MediaLibraryModal';
import styles from './MediaPickerField.module.css';

type AllowedTypes = 'image' | 'video' | 'both';

interface MediaPickerFieldProps {
  label: string;
  value: string;
  onChange: (path: string) => void;
  onTypeChange?: (type: MediaAssetType) => void;
  allowedTypes: AllowedTypes;
  uploadFolder: UploadFolder;
  error?: string;
  required?: boolean;
  maxVideoDurationSec?: number;
  allowUrlInput?: boolean;
  previewAlt?: string;
  valueType?: MediaAssetType;
}

function acceptForTypes(allowed: AllowedTypes): string {
  if (allowed === 'image') return 'image/jpeg,image/png,image/webp';
  if (allowed === 'video') return 'video/mp4,video/webm,video/quicktime';
  return 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';
}

function inferTypeFromFile(file: File): MediaAssetType {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

function isTypeAllowed(fileType: MediaAssetType, allowed: AllowedTypes): boolean {
  if (allowed === 'both') return true;
  return fileType === allowed;
}

export default function MediaPickerField({
  label,
  value,
  onChange,
  onTypeChange,
  allowedTypes,
  uploadFolder,
  error,
  required,
  maxVideoDurationSec,
  allowUrlInput = false,
  previewAlt = '',
  valueType,
}: MediaPickerFieldProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [mediaType, setMediaType] = useState<MediaAssetType>(valueType ?? 'image');

  const {
    fileRef,
    uploading,
    error: uploadError,
    uploadFile,
    openFilePicker,
    clearError,
    setError,
  } = useMediaUpload({ uploadFolder, maxVideoDurationSec });

  const previewSrc = resolveMediaUrl(value);
  const displayError = error || uploadError;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = inferTypeFromFile(file);
    if (!isTypeAllowed(type, allowedTypes)) {
      setError(
        type === 'video'
          ? 'فقط تصویر مجاز است.'
          : 'فقط ویدیو مجاز است.',
      );
      return;
    }

    const path = await uploadFile(file, type);
    if (path) {
      onChange(path);
      setMediaType(type);
      onTypeChange?.(type);
    }
  }

  function handleLibrarySelect(asset: MediaAsset) {
    if (!isTypeAllowed(asset.type, allowedTypes)) return;
    onChange(asset.path);
    setMediaType(asset.type);
    onTypeChange?.(asset.type);
    clearError();
    setLibraryOpen(false);
  }

  function handleRemove() {
    onChange('');
    clearError();
  }

  const effectiveType = valueType ?? mediaType;
  const showVideoPreview =
    value && (effectiveType === 'video' || (allowedTypes === 'video' && previewSrc));

  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && ' *'}
      </span>

      <div className={styles.previewArea}>
        {!value ? (
          <span className={styles.emptyPreview}>رسانه‌ای انتخاب نشده</span>
        ) : showVideoPreview ? (
          <video
            src={previewSrc}
            className={styles.previewVideo}
            controls
            preload="metadata"
          />
        ) : previewSrc ? (
          <img
            src={previewSrc}
            alt={previewAlt}
            className={styles.previewImage}
            loading="lazy"
          />
        ) : null}
      </div>

      <div className={styles.actions}>
        <input
          ref={fileRef}
          type="file"
          accept={acceptForTypes(allowedTypes)}
          className={styles.fileInput}
          onChange={handleFileChange}
          aria-label={`آپلود ${label}`}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={openFilePicker}
        >
          آپلود فایل جدید
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setLibraryOpen(true)}
        >
          انتخاب از کتابخانه
        </Button>
        {value && !uploading && (
          <span className={styles.uploadedBadge}>✓ انتخاب شد</span>
        )}
        {value && (
          <button type="button" className={styles.removeBtn} onClick={handleRemove}>
            حذف
          </button>
        )}
      </div>

      {allowUrlInput && (
        <>
          <button
            type="button"
            className={styles.urlToggle}
            onClick={() => setShowUrl((v) => !v)}
          >
            {showUrl ? 'پنهان کردن آدرس URL' : 'وارد کردن آدرس URL'}
          </button>
          {showUrl && (
            <div className={styles.urlRow}>
              <Input
                label="آدرس URL"
                value={value}
                onChange={(ev) => onChange(ev.target.value)}
                dir="ltr"
              />
            </div>
          )}
        </>
      )}

      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}

      {libraryOpen && (
        <MediaLibraryModal
          allowedTypes={allowedTypes}
          onSelect={handleLibrarySelect}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  );
}
