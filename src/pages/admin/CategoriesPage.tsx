import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '@api/admin/categories';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import AdminToolbar from '@components/admin-toolbar/AdminToolbar';
import CategoryFormModal from '@features/admin/categories/components/CategoryFormModal';
import type { AdminCategory } from '@t/admin-catalog';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import { useToast } from '@hooks/useToast';
import shared from '@styles/admin-shared.module.css';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories', search],
    queryFn: () => adminGetCategories({ search: search || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ name: string; sortOrder: number; isActive: boolean }>;
    }) => adminUpdateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('دسته‌بندی حذف شد.');
    },
    onError: (err: { code?: string; message?: string }) => {
      toast.error(err.message ?? 'خطا در حذف دسته‌بندی.');
    },
  });

  function openCreate() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function openEdit(cat: AdminCategory) {
    setEditingCategory(cat);
    setShowForm(true);
  }

  function handleDelete(cat: AdminCategory) {
    if (!window.confirm(`حذف دسته‌بندی «${cat.name}»؟`)) return;
    deleteMutation.mutate(cat.id);
  }

  const columns: Column<AdminCategory>[] = [
    {
      key: 'sortOrder',
      label: 'ترتیب',
      width: '80px',
      mobileHide: true,
      render: (cat) => <span dir="ltr">{cat.sortOrder.toLocaleString('fa-IR')}</span>,
    },
    {
      key: 'image',
      label: 'تصویر',
      width: '64px',
      mobileHide: true,
      render: (cat) => {
        const src = resolveMediaUrl(cat.imageUrl);
        return src ? (
          <img src={src} alt="" className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder} aria-hidden="true" />
        );
      },
    },
    {
      key: 'name',
      label: 'نام',
      mobileLabel: false,
      render: (cat) => {
        const src = resolveMediaUrl(cat.imageUrl);
        return (
          <div className={styles.nameCell}>
            {/* thumbnail shown only on mobile card view */}
            <div className={styles.mobileThumb} aria-hidden="true">
              {src ? (
                <img src={src} alt="" className={styles.thumb} />
              ) : (
                <div className={styles.thumbPlaceholder} />
              )}
            </div>
            <div>
              <strong>{cat.name}</strong>
              {cat.slug && (
                <span className={styles.slug} dir="ltr">/{cat.slug}</span>
              )}
              {/* sort + layout meta shown only on mobile */}
              <span className={styles.mobileMeta}>
                ترتیب {cat.sortOrder.toLocaleString('fa-IR')}
                {' · '}
                {cat.layoutWidth === '2col' ? 'نیمه عرض' : 'عرض کامل'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'layoutWidth',
      label: 'عرض',
      width: '90px',
      mobileHide: true,
      render: (cat) => (
        <span className={styles.layoutBadge}>
          {cat.layoutWidth === '2col' ? 'نیمه' : 'کامل'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'وضعیت',
      width: '100px',
      render: (cat) => (
        <button
          type="button"
          className={clsx(
            shared.toggleBtn,
            cat.isActive ? shared.active : shared.inactive,
          )}
          onClick={() =>
            updateMutation.mutate({ id: cat.id, payload: { isActive: !cat.isActive } })
          }
          disabled={updateMutation.isPending}
        >
          {cat.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'عملیات',
      width: '140px',
      render: (cat) => (
        <div className={styles.rowActions}>
          <button type="button" className={clsx(styles.actionBtn, styles.editAction)} onClick={() => openEdit(cat)}>
            ویرایش
          </button>
          <button
            type="button"
            className={clsx(styles.actionBtn, styles.deleteAction)}
            onClick={() => handleDelete(cat)}
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
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="جستجوی دسته‌بندی..."
        onAdd={openCreate}
        addLabel="دسته‌بندی جدید"
      />
      <AdminTable
        columns={columns}
        rows={categories}
        rowKey={(c) => c.id}
        loading={isLoading}
        emptyMessage="دسته‌بندی‌ای وجود ندارد."
        rowClassName={(cat) => (!cat.isActive ? styles.inactiveRow : undefined)}
      />
      {showForm && (
        <CategoryFormModal
          initial={editingCategory}
          onClose={() => setShowForm(false)}
          onCreate={async (payload) => {
            await adminCreateCategory(payload);
            qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
            setShowForm(false);
            toast.success('دسته‌بندی ایجاد شد.');
          }}
          onUpdate={async (id, payload) => {
            await adminUpdateCategory(id, payload);
            qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
            setShowForm(false);
            toast.success('دسته‌بندی بروزرسانی شد.');
          }}
        />
      )}
    </div>
  );
}
