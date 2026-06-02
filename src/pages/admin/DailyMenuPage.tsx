import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UtensilsCrossed, ListChecks } from 'lucide-react';
import {
  adminGetDailyMenu,
  adminSetDailyMenu,
  adminUpdateMenuItemStock,
  adminRemoveMenuItem,
} from '@api/admin/daily-menu';
import MenuItemRow from '@features/admin/daily-menu/components/MenuItemRow';
import FoodPickerPanel from '@features/admin/daily-menu/components/FoodPickerPanel';
import Button from '@components/button/Button';
import Skeleton from '@components/skeleton/Skeleton';
import { useToast } from '@hooks/useToast';
import { toJalali } from '@utils/format-date';
import styles from './DailyMenuPage.module.css';

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Tab = 'picker' | 'menu';

export default function DailyMenuPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const today = todayIsoDate();

  const [activeTab, setActiveTab] = useState<Tab>('picker');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [defaultStock, setDefaultStock] = useState('20');
  const [batchLoading, setBatchLoading] = useState(false);

  const { data: menu, isLoading } = useQuery({
    queryKey: ['admin', 'daily-menu', today],
    queryFn: () => adminGetDailyMenu(today),
  });

  const menuItems = menu?.items ?? [];
  const existingFoodIds = new Set(menuItems.map((m) => m.foodId));

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

  function togglePending(foodId: string) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(foodId)) next.delete(foodId);
      else next.add(foodId);
      return next;
    });
  }

  async function handleBatchAdd() {
    const stock = Number(defaultStock);
    if (Number.isNaN(stock) || stock < 0) {
      toast.error('موجودی معتبر وارد کنید.');
      return;
    }
    setBatchLoading(true);
    try {
      const current = await adminGetDailyMenu(today);
      const newItems = [
        ...current.items.map((m) => ({
          foodId: m.foodId,
          stock: m.stock,
          isFeaturedInStory: m.isFeaturedInStory,
        })),
        ...[...pendingIds].map((foodId) => ({
          foodId,
          stock,
          isFeaturedInStory: false,
        })),
      ];
      await adminSetDailyMenu({ menuDate: today, items: newItems });
      const addedCount = pendingIds.size;
      setPendingIds(new Set());
      qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] });
      toast.success(`${addedCount.toLocaleString('fa-IR')} غذا به منو اضافه شد.`);
      setActiveTab('menu');
    } catch {
      toast.error('خطا در افزودن به منو.');
    } finally {
      setBatchLoading(false);
    }
  }

  const hasPending = pendingIds.size > 0;

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.date}>منوی {toJalali(today)}</h2>
          <p className={styles.subtitle}>
            {isLoading
              ? '...'
              : menuItems.length === 0
                ? 'منویی تعریف نشده'
                : `${menuItems.length.toLocaleString('fa-IR')} غذا در منو`}
          </p>
        </div>
        {hasPending && (
          <span className={styles.pendingPill}>
            {pendingIds.size.toLocaleString('fa-IR')} انتخاب شده
          </span>
        )}
      </div>

      {/* Mobile-only tabs */}
      <div className={styles.tabs} role="tablist" aria-label="بخش‌های صفحه">
        <button
          role="tab"
          aria-selected={activeTab === 'picker'}
          className={activeTab === 'picker' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('picker')}
        >
          <UtensilsCrossed size={16} aria-hidden="true" />
          انتخاب غذا
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'menu'}
          className={activeTab === 'menu' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('menu')}
        >
          <ListChecks size={16} aria-hidden="true" />
          منوی امروز
          {menuItems.length > 0 && (
            <span className={styles.tabBadge}>{menuItems.length.toLocaleString('fa-IR')}</span>
          )}
        </button>
      </div>

      {/* Split content area */}
      <div className={styles.body}>
        {/* Food picker panel */}
        <div
          className={
            activeTab === 'picker' ? styles.pickerPanel : `${styles.pickerPanel} ${styles.mobileHidden}`
          }
          role="tabpanel"
          aria-label="انتخاب غذا"
        >
          <FoodPickerPanel
            existingFoodIds={existingFoodIds}
            selectedIds={pendingIds}
            onToggle={togglePending}
          />
        </div>

        {/* Current menu panel */}
        <div
          className={
            activeTab === 'menu' ? styles.menuPanel : `${styles.menuPanel} ${styles.mobileHidden}`
          }
          role="tabpanel"
          aria-label="منوی امروز"
        >
          <div className={styles.menuPanelHeader}>
            <span className={styles.menuPanelTitle}>منوی امروز</span>
          </div>

          {isLoading ? (
            <div className={styles.loadingStack}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={88} borderRadius="var(--radius-lg)" />
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div className={styles.emptyMenu}>
              <span className={styles.emptyIcon}>🍽️</span>
              <p>منویی برای امروز تعریف نشده.</p>
              <p className={styles.emptyHint}>از پنل انتخاب غذا، غذاهای امروز را انتخاب کنید.</p>
              <button
                type="button"
                className={styles.switchTabBtn}
                onClick={() => setActiveTab('picker')}
              >
                رفتن به انتخاب غذا
              </button>
            </div>
          ) : (
            <ul className={styles.menuList}>
              {menuItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onStockChange={(stock) =>
                    updateMutation.mutate({ id: item.id, payload: { stock } })
                  }
                  onStoryToggle={(v) =>
                    updateMutation.mutate({ id: item.id, payload: { isFeaturedInStory: v } })
                  }
                  onRemove={() => handleRemove(item.id, item.food.name)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sticky batch-add bar — slides up when foods are selected */}
      {hasPending && (
        <div className={styles.batchBar} role="region" aria-label="افزودن گروهی غذا">
          <div className={styles.batchLeft}>
            <span className={styles.batchCount}>
              {pendingIds.size.toLocaleString('fa-IR')} غذا انتخاب شد
            </span>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setPendingIds(new Set())}
            >
              پاک کردن
            </button>
          </div>

          <div className={styles.batchRight}>
            <label htmlFor="batch-stock" className={styles.batchStockLabel}>
              موجودی:
            </label>
            <input
              id="batch-stock"
              type="number"
              min={0}
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.target.value)}
              className={styles.batchStockInput}
              dir="ltr"
              aria-label="موجودی پیش‌فرض"
            />
            <Button size="sm" loading={batchLoading} onClick={handleBatchAdd}>
              افزودن به منو
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
