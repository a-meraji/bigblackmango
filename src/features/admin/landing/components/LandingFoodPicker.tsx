import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, GripVertical } from 'lucide-react';
import { adminGetFoods } from '@api/admin/foods';
import { adminGetCategories } from '@api/admin/categories';
import RawLocalizedInput from '@components/input/RawLocalizedInput';
import Skeleton from '@components/skeleton/Skeleton';
import { formatNumber } from '@utils/locale';
import styles from './LandingFoodPicker.module.css';

const ALL = '__all__';
const MAX_FOODS = 8;

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function LandingFoodPicker({ selectedIds, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState(ALL);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories', 'landing-picker'],
    queryFn: () => adminGetCategories({ isActive: true }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: foodsData, isLoading } = useQuery({
    queryKey: ['admin', 'foods', 'landing-picker', debouncedSearch, categoryId],
    queryFn: () =>
      adminGetFoods({
        isActive: true,
        limit: 100,
        search: debouncedSearch || undefined,
        categoryId: categoryId === ALL ? undefined : categoryId,
      }),
    staleTime: 2 * 60 * 1000,
  });

  const foods = foodsData?.items ?? [];
  const selectedFoods = selectedIds
    .map((id) => foods.find((f) => f.id === id))
    .filter(Boolean);

  const { data: selectedFoodsData } = useQuery({
    queryKey: ['admin', 'foods', 'landing-selected', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      const res = await adminGetFoods({ isActive: true, limit: 100 });
      return selectedIds
        .map((id) => res.items.find((f) => f.id === id))
        .filter((f): f is NonNullable<typeof f> => f !== undefined);
    },
    enabled: selectedIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const displaySelected = selectedFoodsData ?? selectedFoods;

  function toggleFood(foodId: string) {
    if (selectedIds.includes(foodId)) {
      onChange(selectedIds.filter((id) => id !== foodId));
      return;
    }
    if (selectedIds.length >= MAX_FOODS) return;
    onChange([...selectedIds, foodId]);
  }

  function removeFood(foodId: string) {
    onChange(selectedIds.filter((id) => id !== foodId));
  }

  function moveFood(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className={styles.wrap}>
      {displaySelected.length > 0 && (
        <ul className={styles.selectedList}>
          {displaySelected.map((food, index) => (
            <li key={food.id} className={styles.selectedItem}>
              <span className={styles.grip} aria-hidden="true">
                <GripVertical size={14} />
              </span>
              <span className={styles.selectedName}>{food.name}</span>
              <div className={styles.selectedActions}>
                <button type="button" className={styles.moveBtn} onClick={() => moveFood(index, -1)}>
                  ↑
                </button>
                <button type="button" className={styles.moveBtn} onClick={() => moveFood(index, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFood(food.id)}
                  aria-label={`حذف ${food.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.hint}>
        {formatNumber(selectedIds.length)} از {formatNumber(MAX_FOODS)} غذا انتخاب شده
        {selectedIds.length === 0 && ' — اگر خالی باشد، غذاهای پیش‌فرض نمایش داده می‌شوند'}
      </p>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={17} className={styles.searchIcon} aria-hidden="true" />
          <RawLocalizedInput
            type="search"
            placeholder="جستجوی غذا..."
            className={styles.searchInput}
            value={search}
            onChange={setSearch}
            aria-label="جستجوی غذا"
          />
        </div>
        <select
          className={styles.categorySelect}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="فیلتر دسته‌بندی"
        >
          <option value={ALL}>همه دسته‌ها</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <ul className={styles.foodList}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <Skeleton height={48} />
              </li>
            ))
          : foods.map((food) => {
              const selected = selectedIds.includes(food.id);
              const disabled = !selected && selectedIds.length >= MAX_FOODS;
              return (
                <li key={food.id}>
                  <button
                    type="button"
                    className={`${styles.foodBtn} ${selected ? styles.foodBtnSelected : ''}`}
                    onClick={() => toggleFood(food.id)}
                    disabled={disabled}
                  >
                    {food.name}
                  </button>
                </li>
              );
            })}
      </ul>
    </div>
  );
}
