import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Package, Plus, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import LucideIcon from '@components/lucide-icon/LucideIcon';
import clsx from 'clsx';
import Modal from '@components/modal/Modal';
import EmptyState from '@components/empty-state/EmptyState';
import Spinner from '@components/spinner/Spinner';
import {
  adminListServiceItems,
  adminUpdateServiceItem,
  adminDeleteServiceItem,
} from '@api/admin/service-items';
import type { AdminPartyServicePage, AdminServiceItem } from '@t/admin-content';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useToast } from '@hooks/useToast';
import ServiceItemFormModal from './ServiceItemFormModal';
import styles from './ServiceItemsManager.module.css';

interface Props {
  service: AdminPartyServicePage;
  onClose: () => void;
}

export default function ServiceItemsManager({ service, onClose }: Props) {
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminServiceItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin', 'service-items', service.id],
    queryFn: () => adminListServiceItems(service.id),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUpdateServiceItem(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'service-items', service.id] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteServiceItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'service-items', service.id] });
      toast.success('خدمت حذف شد.');
    },
    onError: () => toast.error('خطا در حذف.'),
  });

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(item: AdminServiceItem) {
    setEditing(item);
    setShowForm(true);
  }

  function handleDelete(item: AdminServiceItem) {
    if (!window.confirm(`حذف خدمت «${item.title}»؟`)) return;
    deleteMutation.mutate(item.id);
  }

  return (
    <>
      <Modal isOpen onClose={onClose} title={`خدمات «${service.title}»`} size="lg">
        <div className={styles.wrap}>
          <div className={styles.toolbar}>
            {items.length > 0 && (
              <span className={styles.count}>{items.length} خدمت</span>
            )}
            <button type="button" className={styles.addBtn} onClick={openCreate}>
              <Plus size={13} strokeWidth={2.5} />
              افزودن خدمت
            </button>
          </div>

          {isLoading ? (
            <div className={styles.spinnerWrap}>
              <Spinner size="md" label="در حال بارگذاری" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="خدمتی وجود ندارد"
              description="اولین خدمت را اضافه کنید"
              actionLabel="افزودن خدمت"
              onAction={openCreate}
            />
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const thumb = resolveMediaUrl(item.gallery[0] ?? '');
                return (
                  <li key={item.id} className={clsx(styles.item, !item.isActive && styles.itemDim)}>
                    {thumb ? (
                      <img src={thumb} alt="" className={styles.thumb} loading="lazy" />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        {item.icon ? <LucideIcon name={item.icon} size={16} /> : <Package size={16} />}
                      </div>
                    )}

                    <span className={styles.title}>
                      {item.icon && (
                        <span className={styles.titleIcon} aria-hidden="true">
                          <LucideIcon name={item.icon} size={14} />
                        </span>
                      )}
                      {item.title}
                    </span>

                    <div className={styles.chips}>
                      {item.features.length > 0 && (
                        <span className={styles.chip}>{item.features.length} ویژگی</span>
                      )}
                      {item.gallery.length > 0 && (
                        <span className={styles.chip}>{item.gallery.length} تصویر</span>
                      )}
                      <span className={styles.chip}>#{item.sortOrder}</span>
                    </div>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, item.isActive ? styles.iconBtnOn : styles.iconBtnOff)}
                        title={item.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        onClick={() => toggleMutation.mutate({ id: item.id, isActive: !item.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {item.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnEdit)}
                        title="ویرایش"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.iconBtnDel)}
                        title="حذف"
                        onClick={() => handleDelete(item)}
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
        <ServiceItemFormModal
          servicePageId={service.id}
          initial={editing}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
