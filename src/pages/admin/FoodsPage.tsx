import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import CustomSelect from '@components/custom-select/CustomSelect';
import {
  adminGetFoods,
  adminCreateFood,
  adminUpdateFood,
  adminDeleteFood,
  type FoodPayload,
} from '@api/admin/foods';
import { adminGetCategories } from '@api/admin/categories';
import AdminTable, { type Column } from '@components/admin-table/AdminTable';
import AdminToolbar from '@components/admin-toolbar/AdminToolbar';
import FoodFormModal from '@features/admin/foods/components/FoodFormModal';
import { formatPrice } from '@utils/format-price';
import { resolveMediaUrl } from '@utils/resolve-media-url';
import type { AdminFood } from '@t/admin-catalog';
import { useToast } from '@hooks/useToast';
import shared from '@styles/admin-shared.module.css';
import styles from './FoodsPage.module.css';

export default function FoodsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [editingFood, setEditingFood] = useState<AdminFood | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminGetCategories(),
  });

  const { data: foodsData, isLoading } = useQuery({
    queryKey: ['admin', 'foods', search, filterCategoryId, filterActive],
    queryFn: () =>
      adminGetFoods({
        search: search || undefined,
        categoryId: filterCategoryId || undefined,
        isActive: filterActive === '' ? undefined : filterActive === 'true',
        limit: 100,
      }),
  });

  const foods = foodsData?.items ?? [];

  const deleteMutation = useMutation({
    mutationFn: adminDeleteFood,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] });
      toast.success('غذا حذف شد.');
    },
    onError: () => toast.error('خطا در حذف.'),
  });

  function openCreate() {
    setEditingFood(null);
    setShowForm(true);
  }

  function openEdit(food: AdminFood) {
    setEditingFood(food);
    setShowForm(true);
  }

  function handleDelete(food: AdminFood) {
    if (!window.confirm(`حذف «${food.name}»؟`)) return;
    deleteMutation.mutate(food.id);
  }

  const columns: Column<AdminFood>[] = [
    {
      key: 'image',
      label: 'تصویر',
      width: '72px',
      mobileHide: true,
      render: (food) => {
        const src = resolveMediaUrl(food.imageUrl);
        return src ? (
          <img src={src} alt={food.name} className={shared.thumb} loading="lazy" />
        ) : (
          <span className={shared.thumbPlaceholder} aria-hidden="true">—</span>
        );
      },
    },
    {
      key: 'name',
      label: 'نام',
      mobileLabel: false,
      render: (food) => {
        const src = resolveMediaUrl(food.imageUrl);
        return (
          <div className={styles.nameCell}>
            <div className={styles.mobileThumb} aria-hidden="true">
              {src ? (
                <img src={src} alt="" className={shared.thumb} loading="lazy" />
              ) : (
                <span className={shared.thumbPlaceholder}>—</span>
              )}
            </div>
            <div>
              <strong>{food.name}</strong>
              <span className={styles.mobileMeta}>
                {food.category.name}
                {' · '}
                <span dir="ltr">{formatPrice(food.price)}</span>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      label: 'دسته‌بندی',
      mobileHide: true,
      render: (food) => food.category.name,
    },
    {
      key: 'price',
      label: 'قیمت',
      mobileHide: true,
      render: (food) => <span dir="ltr">{formatPrice(food.price)}</span>,
    },
    {
      key: 'tags',
      label: 'تگ‌ها',
      mobileHide: true,
      render: (food) =>
        food.tags.length > 0 ? (
          <span className={styles.tags}>{food.tags.join('، ')}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'isActive',
      label: 'وضعیت',
      width: '90px',
      render: (food) => (
        <span className={food.isActive ? shared.statusActive : shared.statusInactive}>
          {food.isActive ? 'فعال' : 'غیرفعال'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'عملیات',
      width: '140px',
      render: (food) => (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={clsx(styles.actionBtn, styles.editAction)}
            onClick={() => openEdit(food)}
          >
            ویرایش
          </button>
          <button
            type="button"
            className={clsx(styles.actionBtn, styles.deleteAction)}
            onClick={() => handleDelete(food)}
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
        searchPlaceholder="جستجوی غذا..."
        onAdd={openCreate}
        addLabel="غذای جدید"
      >
        <CustomSelect
          value={filterCategoryId}
          onChange={setFilterCategoryId}
          placeholder="همه دسته‌بندی‌ها"
          aria-label="فیلتر دسته‌بندی"
          size="sm"
          options={[
            { value: '', label: 'همه دسته‌بندی‌ها' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <CustomSelect
          value={filterActive}
          onChange={setFilterActive}
          placeholder="همه وضعیت‌ها"
          aria-label="فیلتر وضعیت"
          size="sm"
          options={[
            { value: '', label: 'همه وضعیت‌ها' },
            { value: 'true', label: 'فعال' },
            { value: 'false', label: 'غیرفعال' },
          ]}
        />
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={foods}
        rowKey={(f) => f.id}
        loading={isLoading}
        emptyMessage="غذایی یافت نشد."
        rowClassName={(food) => (!food.isActive ? styles.inactiveRow : undefined)}
      />

      {showForm && (
        <FoodFormModal
          initial={editingFood}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSave={async (payload) => {
            if (editingFood) {
              await adminUpdateFood(editingFood.id, payload);
              toast.success('غذا بروزرسانی شد.');
            } else {
              await adminCreateFood(payload as FoodPayload);
              toast.success('غذا ایجاد شد.');
            }
            qc.invalidateQueries({ queryKey: ['admin', 'foods'] });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
