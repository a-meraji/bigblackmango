import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  adminListPartyServices,
  adminCreatePartyService,
  adminUpdatePartyService,
  adminDeletePartyService,
  type PartyServicePayload,
} from '@api/admin/party-services';
import { adminListBanners } from '@api/admin/banners';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import AdminToolbar from '@components/admin-toolbar/AdminToolbar';
import PartyServiceFormModal from '@features/admin/party-services/components/PartyServiceFormModal';
import type { AdminPartyServicePage } from '@types/admin-content';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useToast } from '@hooks/useToast';
import shared from '@styles/admin-shared.module.css';
import styles from './PartyServicesPage.module.css';

export default function PartyServicesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editingService, setEditingService] = useState<AdminPartyServicePage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin', 'party-services'],
    queryFn: adminListPartyServices,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['admin', 'banners', 'list'],
    queryFn: adminListBanners,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PartyServicePayload> }) =>
      adminUpdatePartyService(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'party-services'] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeletePartyService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'party-services'] });
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('سرویس حذف شد. بنرهای مرتبط غیرفعال شدند.');
    },
    onError: () => toast.error('خطا در حذف.'),
  });

  function openCreate() {
    setEditingService(null);
    setShowForm(true);
  }

  function openEdit(service: AdminPartyServicePage) {
    setEditingService(service);
    setShowForm(true);
  }

  function handleDelete(service: AdminPartyServicePage) {
    const activeBanners = banners.filter(
      (b) => b.servicePage.id === service.id && b.isActive,
    );
    let message = `حذف سرویس «${service.title}»؟`;
    if (activeBanners.length > 0) {
      message += `\n\n${activeBanners.length} بنر فعال به این سرویس متصل است و پس از حذف غیرفعال می‌شود.`;
    }
    if (!window.confirm(message)) return;
    deleteMutation.mutate(service.id);
  }

  const columns: Column<AdminPartyServicePage>[] = [
    {
      key: 'hero',
      label: 'تصویر',
      width: '80px',
      render: (s) => {
        const src = resolveMediaUrl(s.heroImageUrl);
        return src ? (
          <img src={src} alt={s.title} className={styles.heroThumb} loading="lazy" />
        ) : (
          <span className={shared.thumbPlaceholder}>—</span>
        );
      },
    },
    { key: 'title', label: 'عنوان', render: (s) => <strong>{s.title}</strong> },
    {
      key: 'phone',
      label: 'تلفن',
      render: (s) => (
        <span dir="ltr">{s.contactPhone ?? '—'}</span>
      ),
    },
    {
      key: 'faq',
      label: 'سوالات',
      width: '90px',
      render: (s) => `${s.faq.length.toLocaleString('fa-IR')} سوال`,
    },
    {
      key: 'isActive',
      label: 'فعال',
      width: '100px',
      render: (s) => (
        <button
          type="button"
          className={clsx(
            shared.toggleBtn,
            s.isActive ? shared.active : shared.inactive,
          )}
          onClick={() => updateMutation.mutate({ id: s.id, payload: { isActive: !s.isActive } })}
          disabled={updateMutation.isPending}
        >
          {s.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'عملیات',
      width: '140px',
      render: (s) => (
        <div className={shared.actions}>
          <button type="button" className={shared.editBtn} onClick={() => openEdit(s)}>
            ویرایش
          </button>
          <button
            type="button"
            className={shared.deleteBtn}
            onClick={() => handleDelete(s)}
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
      <AdminToolbar onAdd={openCreate} addLabel="سرویس جدید" />
      <AdminTable
        columns={columns}
        rows={services}
        rowKey={(s) => s.id}
        loading={isLoading}
        emptyMessage="سرویسی وجود ندارد."
        rowClassName={(s) => (!s.isActive ? styles.inactiveRow : undefined)}
      />
      {showForm && (
        <PartyServiceFormModal
          initial={editingService}
          onClose={() => setShowForm(false)}
          onSave={async (payload) => {
            if (editingService) {
              await adminUpdatePartyService(editingService.id, payload);
              toast.success('سرویس بروزرسانی شد.');
            } else {
              await adminCreatePartyService(payload as PartyServicePayload);
              toast.success('سرویس ایجاد شد.');
            }
            qc.invalidateQueries({ queryKey: ['admin', 'party-services'] });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
