import { useRef, useState } from 'react';
import Button from '@components/button/Button';
import { uploadImage } from '@api/uploads';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import styles from './GalleryEditor.module.css';

interface GalleryEditorProps {
  gallery: string[];
  onChange: (urls: string[]) => void;
}

export default function GalleryEditor({ gallery, onChange }: GalleryEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);

  function addUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed || gallery.includes(trimmed)) return;
    onChange([...gallery, trimmed]);
    setInput('');
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'party-services');
      addUrl(url);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className={styles.editor}>
      <span className={styles.label}>گالری تصاویر</span>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="URL تصویر"
          dir="ltr"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl(input);
            }
          }}
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => addUrl(input)}>
          افزودن
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          آپلود
        </Button>
      </div>
      {gallery.length > 0 && (
        <div className={styles.grid}>
          {gallery.map((url, index) => {
            const src = resolveMediaUrl(url);
            return (
              <div key={`${url}-${index}`} className={styles.item}>
                {src ? (
                  <img src={src} alt={`تصویر ${index + 1}`} className={styles.thumb} loading="lazy" />
                ) : (
                  <span className={styles.thumbPlaceholder}>—</span>
                )}
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onChange(gallery.filter((_, i) => i !== index))}
                  aria-label="حذف تصویر"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
