import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  adminListBanners,
  adminUpdateBanner,
  adminDeleteBanner,
  type BannerPayload,
} from '@api/admin/banners';
import { adminListPartyServices } from '@api/admin/party-services';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import AdminToolbar from '@components/admin-toolbar/AdminToolbar';
import BannerFormModal from '@features/admin/banners/components/BannerFormModal';
import type { AdminBanner } from '@t/admin-content';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useToast } from '@hooks/useToast';
import shared from '@styles/admin-shared.module.css';
import styles from './BannersPage.module.css';
import { formatNumber } from '@utils/locale';

export default function BannersPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: adminListBanners,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['admin', 'party-services', 'list'],
    queryFn: adminListPartyServices,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BannerPayload> }) =>
      adminUpdateBanner(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteBanner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('بنر حذف شد.');
    },
    onError: () => toast.error('خطا در حذف.'),
  });

  function openCreate() {
    setEditingBanner(null);
    setShowForm(true);
  }

  function openEdit(banner: AdminBanner) {
    setEditingBanner(banner);
    setShowForm(true);
  }

  function handleDelete(banner: AdminBanner) {
    if (!window.confirm(`حذف بنر «${banner.title}»؟`)) return;
    deleteMutation.mutate(banner.id);
  }

  const columns: Column<AdminBanner>[] = [
    {
      key: 'order',
      label: 'ترتیب',
      width: '80px',
      render: (b) => <span dir="ltr">{formatNumber(b.sortOrder)}</span>,
    },
    {
      key: 'image',
      label: 'تصویر',
      width: '88px',
      render: (b) => {
        const src = resolveMediaUrl(b.imageUrl);
        return src ? (
          <img src={src} alt={b.title} className={styles.bannerThumb} loading="lazy" />
        ) : (
          <span className={shared.thumbPlaceholder}>—</span>
        );
      },
    },
    {
      key: 'title',
      label: 'عنوان',
      render: (b) => (
        <div className={styles.titleCell}>
          <strong>{b.title}</strong>
          {b.subtitle && <p className={styles.subtitle}>{b.subtitle}</p>}
        </div>
      ),
    },
    {
      key: 'service',
      label: 'صفحه سرویس',
      render: (b) => b.servicePage.title,
    },
    {
      key: 'isActive',
      label: 'فعال',
      width: '100px',
      render: (b) => (
        <button
          type="button"
          className={clsx(
            shared.toggleBtn,
            b.isActive ? shared.active : shared.inactive,
          )}
          onClick={() => updateMutation.mutate({ id: b.id, payload: { isActive: !b.isActive } })}
          disabled={updateMutation.isPending}
        >
          {b.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'عملیات',
      width: '140px',
      render: (b) => (
        <div className={shared.actions}>
          <button type="button" className={shared.editBtn} onClick={() => openEdit(b)}>
            ویرایش
          </button>
          <button
            type="button"
            className={shared.deleteBtn}
            onClick={() => handleDelete(b)}
            disabled={deleteMutation.isPending}
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminToolbar onAdd={openCreate} addLabel="بنر جدید" />
      <AdminTable
        columns={columns}
        rows={banners}
        rowKey={(b) => b.id}
        loading={isLoading}
        emptyMessage="بنری وجود ندارد."
        rowClassName={(b) => (!b.isActive ? styles.inactiveRow : undefined)}
      />
      {showForm && (
        <BannerFormModal
          initial={editingBanner}
          services={services}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
