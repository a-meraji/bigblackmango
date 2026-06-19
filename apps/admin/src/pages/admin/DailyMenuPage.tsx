import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UtensilsCrossed, ListChecks } from 'lucide-react';
import {
  adminBulkUpdateMenuDiscount,
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
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import { formatNumber, isoToGregorianDate } from '@utils/locale';
import styles from './DailyMenuPage.module.css';

function todayIsoDate(): string {
  return isoToGregorianDate(new Date().toISOString());
}

type Tab = 'picker' | 'menu';
type MenuFilter = 'all' | 'discounted';

export default function DailyMenuPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const today = todayIsoDate();

  const [activeTab, setActiveTab] = useState<Tab>('picker');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  const [menuFilter, setMenuFilter] = useState<MenuFilter>('all');
  const [defaultStock, setDefaultStock] = useState('20');
  const [bulkDiscountInput, setBulkDiscountInput] = useState('20');
  const [batchLoading, setBatchLoading] = useState(false);
  const [bulkDiscountLoading, setBulkDiscountLoading] = useState(false);

  const { data: menu, isLoading } = useQuery({
    queryKey: ['admin', 'daily-menu', today],
    queryFn: () => adminGetDailyMenu(today),
  });

  const menuItems = menu?.items ?? [];
  const existingFoodIds = new Set(menuItems.map((m) => m.foodId));
  const discountedCount = menuItems.filter(
    (item) => item.discountPercent != null && item.discountPercent > 0,
  ).length;

  const visibleMenuItems = useMemo(() => {
    if (menuFilter === 'discounted') {
      return menuItems.filter(
        (item) => item.discountPercent != null && item.discountPercent > 0,
      );
    }
    return menuItems;
  }, [menuFilter, menuItems]);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        stock?: number;
        isFeaturedInStory?: boolean;
        discountPercent?: number | null;
      };
    }) => adminUpdateMenuItemStock(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] }),
    onError: () => toast.error('خطا در بروزرسانی.'),
  });

  const removeMutation = useMutation({
    mutationFn: adminRemoveMenuItem,
    onSuccess: (_, itemId) => {
      qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] });
      setSelectedMenuIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
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

  function toggleMenuSelection(itemId: string, checked: boolean) {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  function toggleSelectAllVisible(checked: boolean) {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      for (const item of visibleMenuItems) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
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
          discountPercent: m.discountPercent,
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
      toast.success(`${formatNumber(addedCount)} غذا به منو اضافه شد.`);
      setActiveTab('menu');
    } catch {
      toast.error('خطا در افزودن به منو.');
    } finally {
      setBatchLoading(false);
    }
  }

  async function handleBulkDiscount(discountPercent: number | null) {
    if (selectedMenuIds.size === 0) return;

    if (discountPercent != null) {
      if (discountPercent < 1 || discountPercent > 100) {
        toast.error('درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.');
        return;
      }
    }

    setBulkDiscountLoading(true);
    try {
      await adminBulkUpdateMenuDiscount({
        menuItemIds: [...selectedMenuIds],
        discountPercent,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'daily-menu'] });
      setSelectedMenuIds(new Set());
      toast.success(
        discountPercent == null
          ? 'تخفیف انتخاب‌شده‌ها حذف شد.'
          : `تخفیف ${formatNumber(discountPercent)}٪ اعمال شد.`,
      );
    } catch {
      toast.error('خطا در اعمال تخفیف.');
    } finally {
      setBulkDiscountLoading(false);
    }
  }

  const hasPending = pendingIds.size > 0;
  const hasMenuSelection = selectedMenuIds.size > 0;
  const allVisibleSelected =
    visibleMenuItems.length > 0 &&
    visibleMenuItems.every((item) => selectedMenuIds.has(item.id));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.date}>منوی {toJalali(today)}</h2>
          <p className={styles.subtitle}>
            {isLoading
              ? '...'
              : menuItems.length === 0
                ? 'منویی تعریف نشده'
                : `${formatNumber(menuItems.length)} غذا در منو${
                    discountedCount > 0
                      ? ` · ${formatNumber(discountedCount)} تخفیف‌دار`
                      : ''
                  }`}
          </p>
        </div>
        {hasPending && (
          <span className={styles.pendingPill}>
            {formatNumber(pendingIds.size)} انتخاب شده
          </span>
        )}
      </div>

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
            <span className={styles.tabBadge}>{formatNumber(menuItems.length)}</span>
          )}
        </button>
      </div>

      <div className={styles.body}>
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

        <div
          className={
            activeTab === 'menu' ? styles.menuPanel : `${styles.menuPanel} ${styles.mobileHidden}`
          }
          role="tabpanel"
          aria-label="منوی امروز"
        >
          <div className={styles.menuPanelHeader}>
            <span className={styles.menuPanelTitle}>منوی امروز</span>
            {menuItems.length > 0 && (
              <div className={styles.menuFilters} role="group" aria-label="فیلتر منو">
                <button
                  type="button"
                  className={menuFilter === 'all' ? styles.filterActive : styles.filterBtn}
                  onClick={() => setMenuFilter('all')}
                >
                  همه
                </button>
                <button
                  type="button"
                  className={
                    menuFilter === 'discounted' ? styles.filterActive : styles.filterBtn
                  }
                  onClick={() => setMenuFilter('discounted')}
                >
                  تخفیف‌دار
                  {discountedCount > 0 && (
                    <span className={styles.filterBadge}>{formatNumber(discountedCount)}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {menuItems.length > 0 && (
            <label className={styles.selectAllRow}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => toggleSelectAllVisible(e.target.checked)}
              />
              <span>انتخاب همه {menuFilter === 'discounted' ? 'تخفیف‌دارها' : 'غذاها'}</span>
            </label>
          )}

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
          ) : visibleMenuItems.length === 0 ? (
            <div className={styles.emptyMenu}>
              <p>غذای تخفیف‌دار در منوی امروز نیست.</p>
              <button
                type="button"
                className={styles.switchTabBtn}
                onClick={() => setMenuFilter('all')}
              >
                نمایش همه غذاها
              </button>
            </div>
          ) : (
            <ul className={styles.menuList}>
              {visibleMenuItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  selected={selectedMenuIds.has(item.id)}
                  onSelectToggle={(checked) => toggleMenuSelection(item.id, checked)}
                  onStockChange={(stock) =>
                    updateMutation.mutate({ id: item.id, payload: { stock } })
                  }
                  onDiscountChange={(discountPercent) =>
                    updateMutation.mutate({ id: item.id, payload: { discountPercent } })
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

      {hasPending && (
        <div className={styles.batchBar} role="region" aria-label="افزودن گروهی غذا">
          <div className={styles.batchLeft}>
            <span className={styles.batchCount}>
              {formatNumber(pendingIds.size)} غذا انتخاب شد
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
            <RawLocalizedInput
              id="batch-stock"
              type="number"
              min={0}
              value={defaultStock}
              onChange={setDefaultStock}
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

      {hasMenuSelection && (
        <div className={styles.discountBar} role="region" aria-label="اعمال تخفیف گروهی">
          <div className={styles.batchLeft}>
            <span className={styles.batchCount}>
              {formatNumber(selectedMenuIds.size)} غذا برای تخفیف انتخاب شد
            </span>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSelectedMenuIds(new Set())}
            >
              پاک کردن
            </button>
          </div>

          <div className={styles.batchRight}>
            <label htmlFor="bulk-discount" className={styles.batchStockLabel}>
              تخفیف %:
            </label>
            <RawLocalizedInput
              id="bulk-discount"
              type="number"
              min={1}
              max={100}
              value={bulkDiscountInput}
              onChange={setBulkDiscountInput}
              className={styles.batchStockInput}
              dir="ltr"
              aria-label="درصد تخفیف گروهی"
            />
            <Button
              size="sm"
              loading={bulkDiscountLoading}
              onClick={() => handleBulkDiscount(Number(bulkDiscountInput))}
            >
              اعمال تخفیف
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={bulkDiscountLoading}
              onClick={() => handleBulkDiscount(null)}
            >
              حذف تخفیف
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
