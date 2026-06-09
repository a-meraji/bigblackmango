import { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import Button from '@components/button/Button';
import IconButton from '@components/icon-button/IconButton';
import { deleteMediaAsset, listMediaAssets } from '@api/admin/media';
import { useFocusTrap } from '@hooks/useFocusTrap';
import { useToast } from '@hooks/useToast';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import type { MediaAsset, MediaAssetType } from '@t/media';
import styles from './MediaLibraryModal.module.css';

type AllowedTypes = 'image' | 'video' | 'both';

interface MediaLibraryModalProps {
  allowedTypes: AllowedTypes;
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
}

const PAGE_SIZE = 24;

export default function MediaLibraryModal({
  allowedTypes,
  onSelect,
  onClose,
}: MediaLibraryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, dialogRef);
  const toast = useToast();

  const [activeType, setActiveType] = useState<MediaAssetType>(
    allowedTypes === 'video' ? 'video' : 'image',
  );
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchType = allowedTypes === 'both' ? activeType : allowedTypes;
  const selectedAsset = items.find((a) => a.id === selectedId) ?? null;

  const loadPage = useCallback(async (pageNum: number, type: MediaAssetType) => {
    setLoading(true);
    setDeleteError('');
    try {
      const res = await listMediaAssets({ type, page: pageNum, limit: PAGE_SIZE });
      setItems(res.items);
      setTotal(res.meta.total);
      setPage(pageNum);
      setSelectedId((prev) =>
        prev && res.items.some((item) => item.id === prev) ? prev : null,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, fetchType);
  }, [fetchType, loadPage]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleting) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, deleting]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleConfirm() {
    if (selectedAsset) onSelect(selectedAsset);
  }

  async function handleDelete(asset: MediaAsset) {
    const label = asset.originalName || asset.filename;
    const confirmed = window.confirm(
      `حذف «${label}» از کتابخانه؟\n\nفایل از سرور حذف می‌شود و این عمل قابل بازگشت نیست.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMediaAsset(asset.id);
      toast.success('فایل از کتابخانه حذف شد.');
      setSelectedId(null);

      const nextTotal = total - 1;
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      const nextPage = page > nextTotalPages ? nextTotalPages : page;
      await loadPage(nextPage, fetchType);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string; details?: string[] };
      if (apiErr.code === 'CONFLICT' && apiErr.details?.length) {
        const places = apiErr.details.join('، ');
        const msg = `این فایل در بخش‌های زیر استفاده می‌شود و قابل حذف نیست: ${places}`;
        setDeleteError(msg);
        toast.error(msg);
      } else {
        const msg = 'حذف فایل ناموفق بود.';
        setDeleteError(msg);
        toast.error(msg);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.overlay} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="کتابخانه رسانه"
      >
        <div className={styles.header}>
          <span className={styles.title}>انتخاب از کتابخانه</span>
          <IconButton
            icon={X}
            label="بستن کتابخانه"
            variant="ghost"
            onClick={onClose}
            disabled={deleting}
          />
        </div>

        {allowedTypes === 'both' && (
          <div className={styles.tabs} role="tablist" aria-label="نوع رسانه">
            {(['image', 'video'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={activeType === t}
                className={`${styles.tab} ${activeType === t ? styles.tabActive : ''}`}
                disabled={deleting}
                onClick={() => {
                  setActiveType(t);
                  setSelectedId(null);
                  setDeleteError('');
                }}
              >
                {t === 'image' ? 'تصاویر' : 'ویدیوها'}
              </button>
            ))}
          </div>
        )}

        <div className={styles.body}>
          {deleteError && (
            <p className={styles.deleteError} role="alert">
              {deleteError}
            </p>
          )}

          {loading ? (
            <p className={styles.loading}>در حال بارگذاری...</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>فایلی در کتابخانه یافت نشد.</p>
          ) : (
            <div className={styles.grid} role="listbox" aria-label="فایل‌های رسانه">
              {items.map((asset) => {
                const src = resolveMediaUrl(asset.path);
                const isSelected = selectedId === asset.id;
                return (
                  <div
                    key={asset.id}
                    className={`${styles.itemWrap} ${isSelected ? styles.itemWrapSelected : ''}`}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                      onClick={() => {
                        setSelectedId(asset.id);
                        setDeleteError('');
                      }}
                      onDoubleClick={() => onSelect(asset)}
                      title={asset.originalName}
                      disabled={deleting}
                    >
                      {asset.type === 'image' && src ? (
                        <img src={src} alt="" className={styles.thumb} loading="lazy" />
                      ) : (
                        <div className={styles.videoPlaceholder} aria-hidden="true">
                          ▶
                        </div>
                      )}
                      <span className={styles.badge}>
                        {asset.type === 'image' ? 'تصویر' : 'ویدیو'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label={`حذف ${asset.originalName}`}
                      title="حذف از کتابخانه"
                      disabled={deleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(asset);
                      }}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.pageInfo}>
            صفحه {page} از {totalPages} ({total} فایل)
          </span>
          <div className={styles.pageBtns}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading || deleting}
              onClick={() => loadPage(page - 1, fetchType)}
            >
              قبلی
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading || deleting}
              onClick={() => loadPage(page + 1, fetchType)}
            >
              بعدی
            </Button>
            {selectedAsset && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={() => void handleDelete(selectedAsset)}
              >
                حذف
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              disabled={!selectedId || deleting}
              onClick={handleConfirm}
            >
              انتخاب
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
