import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Image, Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Modal from '@components/modal/Modal';
import EmptyState from '@components/empty-state/EmptyState';
import Spinner from '@components/spinner/Spinner';
import {
  adminListHighlights,
  adminUpdateHighlight,
  adminDeleteHighlight,
} from '@api/admin/party-service-highlights';
import type { AdminPartyServicePage, AdminPartyServiceHighlight } from '@t/admin-content';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useToast } from '@hooks/useToast';
import HighlightFormModal from './HighlightFormModal';
import styles from './HighlightsManager.module.css';

interface HighlightsManagerProps {
  service: AdminPartyServicePage;
  onClose: () => void;
}

export default function HighlightsManager({ service, onClose }: HighlightsManagerProps) {
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<AdminPartyServiceHighlight | null>(null);

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: ['admin', 'highlights', service.id],
    queryFn: () => adminListHighlights(service.id),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUpdateHighlight(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'highlights', service.id] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteHighlight,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'highlights', service.id] });
      toast.success('هایلایت حذف شد.');
    },
    onError: () => toast.error('خطا در حذف هایلایت.'),
  });

  function openCreate() {
    setEditingHighlight(null);
    setShowForm(true);
  }

  function openEdit(h: AdminPartyServiceHighlight) {
    setEditingHighlight(h);
    setShowForm(true);
  }

  function handleDelete(h: AdminPartyServiceHighlight) {
    if (!window.confirm(`حذف هایلایت «${h.title}»؟`)) return;
    deleteMutation.mutate(h.id);
  }

  return (
    <>
      <Modal isOpen onClose={onClose} title={`هایلایت‌های «${service.title}»`} size="lg">
        <div className={styles.wrap}>
          <div className={styles.toolbar}>
            {highlights.length > 0 && (
              <span className={styles.count}>{highlights.length} هایلایت</span>
            )}
            <button type="button" className={styles.addBtn} onClick={openCreate}>
              <Plus size={13} strokeWidth={2.5} />
              افزودن هایلایت
            </button>
          </div>

          {isLoading ? (
            <div className={styles.spinnerWrap}>
              <Spinner size="md" label="در حال بارگذاری" />
            </div>
          ) : highlights.length === 0 ? (
            <EmptyState
              icon={Video}
              title="هایلایتی وجود ندارد"
              description="اولین هایلایت را اضافه کنید"
              actionLabel="افزودن هایلایت"
              onAction={openCreate}
            />
          ) : (
            <ul className={styles.list}>
              {highlights.map((h) => {
                const thumb = resolveMediaUrl(
                  h.thumbnailUrl ?? (h.mediaType === 'image' ? h.mediaUrl : ''),
                );
                return (
                  <li key={h.id} className={clsx(styles.item, !h.isActive && styles.itemDim)}>
                    {thumb ? (
                      <img src={thumb} alt="" className={styles.thumb} loading="lazy" />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        {h.mediaType === 'image' ? <Image size={15} /> : <Video size={15} />}
                      </div>
                    )}

                    <span className={styles.title}>{h.title}</span>

                    <span className={styles.chip}>#{h.sortOrder}</span>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, h.isActive ? styles.iconBtnOn : styles.iconBtnOff)}
                        title={h.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        onClick={() => toggleMutation.mutate({ id: h.id, isActive: !h.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {h.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnEdit)}
                        title="ویرایش"
                        onClick={() => openEdit(h)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnDel)}
                        title="حذف"
                        onClick={() => handleDelete(h)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>

      {showForm && (
        <HighlightFormModal
          servicePageId={service.id}
          initial={editingHighlight}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
