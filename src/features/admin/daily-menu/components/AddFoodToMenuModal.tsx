import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminGetFoods } from '@api/admin/foods';
import { adminGetDailyMenu, adminSetDailyMenu } from '@api/admin/daily-menu';
import Modal from '@components/modal/Modal';
import Button from '@components/button/Button';
import { useToast } from '@hooks/useToast';
import styles from './AddFoodToMenuModal.module.css';

interface AddFoodToMenuModalProps {
  menuDate: string;
  existingFoodIds: string[];
  onClose: () => void;
  onAdded: () => void;
}

export default function AddFoodToMenuModal({
  menuDate,
  existingFoodIds,
  onClose,
  onAdded,
}: AddFoodToMenuModalProps) {
  const toast = useToast();
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [stock, setStock] = useState('20');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: foodsData, isLoading: foodsLoading } = useQuery({
    queryKey: ['admin', 'foods', 'active-menu-picker'],
    queryFn: () => adminGetFoods({ isActive: true, limit: 100 }),
  });

  const foods = foodsData?.items ?? [];
  const availableFoods = foods.filter((f) => !existingFoodIds.includes(f.id));

  async function handleAdd() {
    if (!selectedFoodId) return;
    const stockNum = Number(stock);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      toast.error('موجودی معتبر وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const current = await adminGetDailyMenu(menuDate);
      const newItems = [
        ...current.items.map((m) => ({
          foodId: m.foodId,
          stock: m.stock,
          isFeaturedInStory: m.isFeaturedInStory,
        })),
        {
          foodId: selectedFoodId,
          stock: stockNum,
          isFeaturedInStory: featured,
        },
      ];
      await adminSetDailyMenu({ menuDate, items: newItems });
      onAdded();
      toast.success('غذا به منو اضافه شد.');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      toast.error(apiErr.message ?? 'خطا در افزودن به منو.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="افزودن غذا به منوی امروز">
      <div className={styles.form}>
        <div>
          <label className={styles.label} htmlFor="menu-food-select">
            انتخاب غذا
          </label>
          <select
            id="menu-food-select"
            className={styles.select}
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(e.target.value)}
            disabled={foodsLoading}
          >
            <option value="">
              {foodsLoading
                ? 'در حال بارگذاری...'
                : availableFoods.length === 0
                  ? 'غذای فعالی برای افزودن نیست'
                  : 'انتخاب کنید'}
            </option>
            {availableFoods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="menu-initial-stock">
            موجودی اولیه
          </label>
          <input
            id="menu-initial-stock"
            type="number"
            min={0}
            className={styles.stockInput}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            dir="ltr"
          />
        </div>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          نمایش در استوری
        </label>

        <Button
          fullWidth
          loading={loading}
          disabled={!selectedFoodId || availableFoods.length === 0}
          onClick={handleAdd}
        >
          افزودن به منو
        </Button>
      </div>
    </Modal>
  );
}
