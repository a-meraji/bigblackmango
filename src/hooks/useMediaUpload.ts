import { useRef, useState } from 'react';
import {
  uploadImage,
  uploadVideo,
  checkVideoDuration,
  type UploadFolder,
} from '@api/uploads';
import type { MediaAssetType } from '@t/media';

interface UseMediaUploadOptions {
  uploadFolder: UploadFolder;
  maxVideoDurationSec?: number;
}

export function useMediaUpload({ uploadFolder, maxVideoDurationSec }: UseMediaUploadOptions) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function uploadFile(
    file: File,
    type: MediaAssetType,
  ): Promise<string | null> {
    setError('');
    setUploading(true);

    try {
      if (type === 'video') {
        if (maxVideoDurationSec) {
          const duration = await checkVideoDuration(file);
          if (duration > maxVideoDurationSec) {
            setError(
              `مدت ویدیو نباید بیشتر از ${maxVideoDurationSec} ثانیه باشد (مدت فعلی: ${Math.round(duration)} ثانیه)`,
            );
            return null;
          }
        }
        return await uploadVideo(file, uploadFolder);
      }
      return await uploadImage(file, uploadFolder);
    } catch {
      setError(type === 'video' ? 'آپلود ویدیو ناموفق بود.' : 'آپلود تصویر ناموفق بود.');
      return null;
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function openFilePicker() {
    fileRef.current?.click();
  }

  function clearError() {
    setError('');
  }

  return {
    fileRef,
    uploading,
    error,
    uploadFile,
    openFilePicker,
    clearError,
    setError,
  };
}
