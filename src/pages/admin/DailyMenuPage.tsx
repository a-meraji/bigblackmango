import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import {
  adminGetDailyMenu,
  adminUpdateMenuItemStock,
  adminRemoveMenuItem,
} from '@api/admin/daily-menu';
import MenuItemRow from '@features/admin/daily-menu/components/MenuItemRow';
import AddFoodToMenuModal from '@features/admin/daily-menu/components/AddFoodToMenuModal';
import Button from '@components/button/Button';
import Skeleton from '@components/skeleton/Skeleton';
import { useToast } from '@hooks/useToast';
import { toJalali } from '@utils/format-date';
import styles from './DailyMenuPage.module.css';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DailyMenuPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const today = todayIsoDate();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: menu, isLoading } = useQuery({
    queryKey: ['admin', 'daily-menu', today],
    queryFn: () => adminGetDailyMenu(today),
  });

  const menuItems = menu?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { stock?: number; isFeaturedInStory?: boolean };
    }) => adminUpdateMenuItemStock(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const removeMutation = useMutation({
    mutationFn: adminRemoveMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] });
      toast.success('غذا از منو حذف شد.');
    },
    onError: () => toast.error('خطا در حذف.'),
  });

  function handleRemove(itemId: string, foodName: string) {
    if (!window.confirm(`حذف «${foodName}» از منوی امروز؟`)) return;
    removeMutation.mutate(itemId);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.date}>منوی {toJalali(today)}</h2>
          <p className={styles.count}>
            {isLoading ? '...' : `${menuItems.length.toLocaleString('fa-IR')} غذا در منو`}
          </p>
        </div>
        <Button type="button" onClick={() => setShowAddModal(true)}>
          <Plus size={18} aria-hidden="true" />
          افزودن غذا به منو
        </Button>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={88} borderRadius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {!isLoading && menuItems.length === 0 && (
        <div className={styles.empty} role="status">
          <p>منویی برای امروز تعریف نشده است.</p>
          <Button type="button" variant="secondary" onClick={() => setShowAddModal(true)}>
            اولین غذا را اضافه کنید
          </Button>
        </div>
      )}

      {!isLoading && menuItems.length > 0 && (
        <ul className={styles.list}>
          {menuItems.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              onStockChange={(stock) => updateMutation.mutate({ id: item.id, payload: { stock } })}
              onStoryToggle={(v) =>
                updateMutation.mutate({ id: item.id, payload: { isFeaturedInStory: v } })
              }
              onRemove={() => handleRemove(item.id, item.food.name)}
            />
          ))}
        </ul>
      )}

      {showAddModal && (
        <AddFoodToMenuModal
          menuDate={today}
          existingFoodIds={menuItems.map((m) => m.foodId)}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
